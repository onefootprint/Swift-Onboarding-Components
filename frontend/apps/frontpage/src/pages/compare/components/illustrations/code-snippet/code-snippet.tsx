import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import styled, { css } from 'styled-components';

const snippet = `
  <div
    id="footprint-button"
    data-fp-pk="pk_test_yflLnFW219f9bC0pdyGd"
    onComplete="onFootprintComplete"
  />
`;

const CodeSnippet = () => (
  <Container>
    <Code useInlineStyles={false} language="html" wrapLongLines wrapLines>
      {snippet}
    </Code>
  </Container>
);

const Code = styled(SyntaxHighlighter)`
  user-select: none;
  background: transparent !important;
  font-family: monospace;
  color: #fff;
  line-height: 1.5;

  .hljs-attr {
    color: #d7ff92;
  }

  .hljs-string {
    color: #9dd5ff;
  }
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #0c102c;
    box-shadow: inset 0px 4px 60px rgba(6, 11, 40, 0.3);
    padding: ${theme.spacing[4]};
  `}
`;

export default CodeSnippet;
