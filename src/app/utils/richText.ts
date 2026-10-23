import type { FallbackResolver } from '@contentful/rich-text-from-markdown';
import { BLOCKS, INLINES, MARKS, type Document, type Hyperlink, type Paragraph, type Text } from '@contentful/rich-text-types';

// 変換ライブラリが対応していないMarkdownノード(mdast)のうち、ここで扱うもの
type MarkdownNode = Parameters<FallbackResolver>[0] & {
  identifier?: string;
  url?: string;
};

const text = (value: string, marks: Text['marks'] = []): Text => ({ nodeType: 'text', value, marks, data: {} });

const paragraph = (content: Paragraph['content'], data: Paragraph['data'] = {}): Paragraph => ({
  nodeType: BLOCKS.PARAGRAPH,
  data,
  content,
});

// 子ノードの文字だけを取り出す
const toPlainText = (node: MarkdownNode): string =>
  typeof node.value === 'string' ? node.value : (node.children ?? []).map(toPlainText).join('');

// 変換できない場合は入力をそのまま段落として表示する
const plainTextToRichText = (value: string): Document => ({
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: [paragraph([text(value)])],
});

// Markdownの文字列をContentfulのリッチテキスト(Document)に変換する
export async function markdownToRichText(markdown: string): Promise<Document> {
  try {
    // パーサー(remark等)が重いため、初回読み込みのバンドルから分離する
    const { richTextFromMarkdown } = await import('@contentful/rich-text-from-markdown');

    // 参照リンクの定義([ref]: url)は参照より後に来るため、先に集めておく
    const definitions = new Map<string, string>();
    await richTextFromMarkdown(markdown, async (node: MarkdownNode) => {
      if (node.type === 'definition' && node.identifier && node.url) {
        definitions.set(node.identifier, node.url);
      }
      return null;
    });

    return await richTextFromMarkdown(markdown, async (node: MarkdownNode) => {
      switch (node.type) {
        // 行末のスペース2つ・バックスラッシュによる改行(描画側で<br>にする)
        case 'break':
          return text('\n');

        // 参照リンク([text][ref])は通常のリンクとして扱う
        case 'linkReference': {
          const label = toPlainText(node);
          const uri = node.identifier ? definitions.get(node.identifier) : undefined;
          if (!uri) return text(label);
          const link: Hyperlink = { nodeType: INLINES.HYPERLINK, data: { uri }, content: [text(label)] };
          return link;
        }

        // コードブロック(```)はcode装飾の段落として残し、描画側で<pre>にする
        case 'code':
          return paragraph([text(node.value, [{ type: MARKS.CODE }])], { isCodeBlock: true });

        default:
          return null;
      }
    });
  } catch (error) {
    console.error('Error converting markdown to rich text:', error);
    return plainTextToRichText(markdown);
  }
}
