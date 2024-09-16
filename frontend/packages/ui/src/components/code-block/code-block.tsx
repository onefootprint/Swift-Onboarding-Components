import type React from 'react';
import { useTranslation } from 'react-i18next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import styled, { css, useTheme } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import CopyButton from '../copy-button';
import Stack from '../stack';
import Text from '../text';

export type CodeBlockProps = {
  ariaLabel?: string;
  children: string;
  disableCopy?: boolean;
  highlightedLines?: number[];
  language: string;
  showLineNumbers?: boolean;
  title?: string | React.ReactNode;
  tooltip?: {
    position?: 'top' | 'bottom' | 'left' | 'right';
    text?: string;
    textConfirmation?: string;
  };
};

const CodeBlock = ({
  ariaLabel,
  children,
  disableCopy,
  highlightedLines = [],
  language,
  showLineNumbers,
  title,
  tooltip,
}: CodeBlockProps) => {
  const { t } = useTranslation('ui');
  const theme = useTheme();

  return (
    <Container>
      <Stack
        backgroundColor="secondary"
        borderBottomWidth={1}
        borderColor="tertiary"
        borderStyle="solid"
        height="40px"
        justifyContent="space-between"
        paddingInline={5}
        width="100%"
      >
        <Text
          alignItems="center"
          color="secondary"
          display="flex"
          gap={3}
          justifyContent="center"
          maxWidth="100%"
          overflow="hidden"
          tag="h5"
          variant="label-3"
        >
          {title || language}
        </Text>
        {disableCopy ? null : (
          <CopyButton
            ariaLabel={ariaLabel ?? t('components.code-block.aria-label-default')}
            contentToCopy={children}
            size="compact"
            tooltip={{
              position: tooltip?.position ?? 'top',
              text: tooltip?.text ?? t('components.code-block.tooltip-text-default'),
              textConfirmation:
                tooltip?.textConfirmation ?? t('components.code-inline.tooltip-text-confirmation-default'),
            }}
          />
        )}
      </Stack>
      <Content>
        <SyntaxHighlighter
          language={language}
          showLineNumbers={showLineNumbers}
          style={theme.codeHighlight}
          wrapLines
          lineNumberStyle={{ color: theme.color.tertiary, WebkitUserSelect: 'none' }}
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
