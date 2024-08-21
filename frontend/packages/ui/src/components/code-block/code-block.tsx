import type React from 'react';
import { useTranslation } from 'react-i18next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import styled, { css, useTheme } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import Box from '../box';
import CopyButton from '../copy-button';
import Stack from '../stack';

export type CodeBlockProps = {
  ariaLabel?: string;
  children: string;
  disableCopy?: boolean;
  highlightedLines?: number[];
  language: string;
  showLineNumbers?: boolean;
  title?: string | React.ReactNode;
  tooltipText?: string;
  tooltipTextConfirmation?: string;
};

const CodeBlock = ({
  ariaLabel,
  children,
  disableCopy,
  highlightedLines = [],
  language,
  showLineNumbers,
  title,
  tooltipText,
  tooltipTextConfirmation,
}: CodeBlockProps) => {
  const { t } = useTranslation('ui');
  const theme = useTheme();

  return (
    <Container>
      <Stack
        justifyContent="space-between"
        backgroundColor="secondary"
        borderBottomWidth={1}
        borderStyle="solid"
        borderColor="tertiary"
        width="100%"
        paddingInline={5}
        height="48px"
      >
        <Title tag="h5">{title || language}</Title>
        {!disableCopy && (
          <CopyButton
            size="compact"
            contentToCopy={children}
            tooltipText={tooltipText ?? t('components.code-block.tooltip-text-default')}
            tooltipTextConfirmation={
              tooltipTextConfirmation ?? t('components.code-inline.tooltip-text-confirmation-default')
            }
            ariaLabel={ariaLabel ?? t('components.code-block.aria-label-default')}
          />
        )}
      </Stack>
      <Content>
        <SyntaxHighlighter
          language={language}
          showLineNumbers={showLineNumbers}
          style={theme.codeHighlight}
          wrapLines
          lineNumberStyle={{ color: theme.color.tertiary }}
          lineProps={lineNumber => {
            if (highlightedLines.includes(lineNumber)) {
              return {
                style: {
                  backgroundColor: theme.backgroundColor.warning,
                  display: 'block',
                  marginLeft: `-${theme.spacing[5]}`,
                  marginRight: `-${theme.spacing[5]}`,
                  paddingLeft: theme.spacing[5],
                  paddingRight: theme.spacing[5],
                },
              };
            }
            return {};
          }}
        >
          {children}
        </SyntaxHighlighter>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  `}
`;

const Title = styled(Box)`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    color: ${theme.color.secondary};
    gap: ${theme.spacing[3]};
    max-width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  `}

`;

const Content = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2', 'code')};
    background: ${theme.backgroundColor.primary};
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
      padding: ${theme.spacing[4]} !important;
      background-color: ${theme.backgroundColor.primary} !important;
    }
  `}
`;

export default CodeBlock;
