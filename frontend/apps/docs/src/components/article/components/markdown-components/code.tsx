import { CodeBlock, CodeInline } from '@onefootprint/ui';
import React from 'react';

type CodeProps = {
  inline?: boolean;
  className?: string;
  children: string;
};

const Code = ({ inline, className, children }: CodeProps) => {
  const language = className && className.replace('lang-', '');
  return inline || !language ? (
    <CodeInline disabled>{children}</CodeInline>
  ) : (
    <CodeBlock language={language}>{children}</CodeBlock>
  );
};

export default Code;
