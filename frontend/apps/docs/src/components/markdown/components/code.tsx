import { CodeBlock, CodeInline } from '@onefootprint/ui';

type CodeProps = {
  children: string;
  className?: string;
  filename?: string;
  highlight?: string;
  inline?: boolean;
};

const Code = ({ children, className, filename, highlight = '', inline }: CodeProps) => {
  const language = className?.replace('lang-', '');
  const highlightLines = highlight.split(',');

  return inline || !language ? (
    <CodeInline disabled>{children}</CodeInline>
  ) : (
    <CodeBlock
      highlightedLines={highlightLines.map(line => Number.parseInt(line, 10))}
      language={language}
      showLineNumbers
      title={filename}
    >
      {children}
    </CodeBlock>
  );
};

export default Code;
