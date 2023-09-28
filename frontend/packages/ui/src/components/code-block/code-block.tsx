import styled, { css, useTheme } from '@onefootprint/styled';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { createFontStyles } from '../../utils/mixins';
import CopyButton from '../copy-button';
import Typography from '../typography';

export type CodeBlockProps = {
  title?: string;
  language: string;
  children: string;
  tooltipText?: string;
  tooltipTextConfirmation?: string;
  ariaLabel?: string;
};

const CodeBlock = ({
  title,
  language,
  children,
  tooltipText = 'Copy to clipboard',
  tooltipTextConfirmation = 'Copied!',
  ariaLabel = 'Copy to clipboard',
}: CodeBlockProps) => {
  const theme = useTheme();

  return (
    <Container>
      <Header>
        <Typography variant="label-3">{title || language}</Typography>
        <CopyButton
          contentToCopy={children}
          tooltipText={tooltipText}
          tooltipTextConfirmation={tooltipTextConfirmation}
          ariaLabel={ariaLabel}
        />
      </Header>
      <Content>
        <SyntaxHighlighter language={language} style={theme.codeHighlight}>
          {children}
        </SyntaxHighlighter>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    overflow: hidden;
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    width: 100%;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2', 'code')};
    background: transparent;
    position: relative;
    width: 100%;

    &::before,
    &::after {
      pointer-events: none;
      content: '';
      position: absolute;
      top: 0px;
      bottom: ${theme.spacing[3]};
    }

    &::before {
      left: 0px;
      width: ${theme.spacing[5]};
      background: linear-gradient(
        -90deg,
        rgba(255, 255, 255, 0),
        ${theme.backgroundColor.primary}
      );
    }

    &::after {
      right: 0px;
      width: ${theme.spacing[7]};
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        ${theme.backgroundColor.primary} 80%
      );
    }

    pre {
      text-align: left;
      padding: ${theme.spacing[5]} !important;
      background: none !important;
    }
  `}
`;

export default CodeBlock;
