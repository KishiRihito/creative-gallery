import { BLOCKS, MARKS, type Document, type Paragraph } from '@contentful/rich-text-types';

// Markdownの文字列をContentfulのリッチテキスト(Document)に変換する
export async function markdownToRichText(markdown: string): Promise<Document> {
  // パーサー(remark等)が重いため、初回読み込みのバンドルから分離する
  const { richTextFromMarkdown } = await import('@contentful/rich-text-from-markdown');
  return richTextFromMarkdown(markdown, async (node) => {
    // コードブロック(```)は変換対象外のため、code装飾のみの段落として残す(描画側で<pre>にする)
    if (node.type === 'code' && 'value' in node && typeof node.value === 'string') {
      const paragraph: Paragraph = {
        nodeType: BLOCKS.PARAGRAPH,
        data: {},
        content: [{ nodeType: 'text', value: node.value, marks: [{ type: MARKS.CODE }], data: {} }],
      };
      return paragraph;
    }
    return null;
  });
}
