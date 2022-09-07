import React from 'react';
import { CodeBlock, CodeInline } from 'ui';

type CodeProps = {
  inline?: boolean;
  className?: string;
  children: string;
};

const Code = ({ inline, className, children }: CodeProps) => {
  const language = className && className.replace('lang-', '');
  return inline || !language ? (
    <CodeInline disable>{children}</CodeInline>
  ) : (
    <CodeBlock language={language}>{children}</CodeBlock>
  );
};

export default Code;
