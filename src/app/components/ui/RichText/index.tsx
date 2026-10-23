import { Fragment, type ReactNode } from 'react';
import { documentToReactComponents, type Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS, type Document } from '@contentful/rich-text-types';

import style from './richText.module.scss';

interface RichTextProps {
  document: Document;
  className?: string;
}

const options: Options = {
  renderMark: {
    [MARKS.CODE]: (text) => <code className={style['code']}>{text}</code>,
  },
  renderNode: {
    // コードブロックは変換時(utils/richText)に目印を付けている
    [BLOCKS.PARAGRAPH]: (node, children) =>
      node.data.isCodeBlock ? <pre className={style['pre']}>{children}</pre> : <p>{children}</p>,
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
