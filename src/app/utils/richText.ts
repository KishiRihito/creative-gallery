import type { FallbackResolver } from '@contentful/rich-text-from-markdown';
import { BLOCKS, MARKS, type Document, type Paragraph, type Text } from '@contentful/rich-text-types';

// 変換ライブラリが対応していないMarkdownノード(mdast)のうち、ここで扱うもの
type MarkdownNode = Parameters<FallbackResolver>[0] & {
  identifier?: string;
  url?: string;
  position?: { start: { offset: number }; end: { offset: number } };
};

const text = (value: string, marks: Text['marks'] = []): Text => ({ nodeType: 'text', value, marks, data: {} });

const paragraph = (content: Paragraph['content'], data: Paragraph['data'] = {}): Paragraph => ({
  nodeType: BLOCKS.PARAGRAPH,
  data,
  content,
});

// 子ノードの文字だけを取り出す
const toPlainText = (node: MarkdownNode): string => {
  if (node.type === 'break') return '\n';
  return typeof node.value === 'string' ? node.value : (node.children ?? []).map(toPlainText).join('');
};

// 参照リンク([text][ref])を通常のリンク([text](url))に書き換える
// 変換ライブラリが参照リンクに対応していないため、書き換えてから変換して太字などの装飾も保つ
const resolveLinkReferences = (markdown: string, references: MarkdownNode[], definitions: Map<string, string>) =>
  // 後ろから書き換えて、前方の位置(offset)がずれないようにする
  [...references]
    .sort((a, b) => (b.position?.start.offset ?? 0) - (a.position?.start.offset ?? 0))
    .reduce((md, node) => {
      const uri = node.identifier ? definitions.get(node.identifier) : undefined;
      const children = node.children ?? [];
      const first = (children[0] as MarkdownNode | undefined)?.position;
      const last = (children.at(-1) as MarkdownNode | undefined)?.position;
      if (!uri || !node.position) return md;

      const label = first && last ? md.slice(first.start.offset, last.end.offset) : '';
      const destination = uri.replace(/[<>\s]/g, encodeURIComponent);
      return `${md.slice(0, node.position.start.offset)}[${label}](<${destination}>)${md.slice(node.position.end.offset)}`;
    }, markdown);

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

    // 参照リンクと定義([ref]: url)を集める(定義は参照より後に来るため、一度通して集める)
    const references: MarkdownNode[] = [];
    const definitions = new Map<string, string>();
    await richTextFromMarkdown(markdown, async (node: MarkdownNode) => {
      if (node.type === 'linkReference') references.push(node);
      // 同じ識別子の定義が複数ある場合はMarkdownの仕様どおり最初のものを使う
      if (node.type === 'definition' && node.identifier && node.url && !definitions.has(node.identifier)) {
        definitions.set(node.identifier, node.url);
      }
      return null;
    });

    return await richTextFromMarkdown(resolveLinkReferences(markdown, references, definitions), async (node: MarkdownNode) => {
      switch (node.type) {
        // 行末のスペース2つ・バックスラッシュによる改行(描画側で<br>にする)
        case 'break':
          return text('\n');

        // 書き換えられなかった参照リンクは文字だけ残す
        case 'linkReference':
          return text(toPlainText(node));

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
