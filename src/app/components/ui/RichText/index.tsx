import { Fragment, type ReactNode } from 'react';
import { documentToReactComponents, type Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS, type Document, type Text } from '@contentful/rich-text-types';

import style from './richText.module.scss';

interface RichTextProps {
  document: Document;
  className?: string;
}

// 段落内がすべてcode装飾のテキストならコードブロックとみなす
const isCodeBlock = (content: Document['content'][number]['content']) =>
  content.length > 0 &&
  content.every((node) => node.nodeType === 'text' && (node as Text).marks.some((mark) => mark.type === MARKS.CODE));

const options: Options = {
  renderMark: {
    [MARKS.CODE]: (text) => <code className={style['code']}>{text}</code>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) =>
      isCodeBlock(node.content) ? <pre className={style['pre']}>{children}</pre> : <p>{children}</p>,
    [INLINES.HYPERLINK]: (node, children) => (
      <a href={node.data.uri} target="_blank" rel="noopener noreferrer">{children}</a>
    ),
  },
  // 入力した改行をそのまま反映する
  renderText: (text) =>
    text.split('\n').reduce<ReactNode[]>((acc, line, i) => {
      if (i > 0) acc.push(<br key={`br-${i}`} />);
      acc.push(<Fragment key={i}>{line}</Fragment>);
      return acc;
    }, []),
};

export const RichText = ({ document, className }: RichTextProps) => (
  <div className={[style['rich-text'], className].filter(Boolean).join(' ')}>
    {documentToReactComponents(document, options)}
  </div>
);
