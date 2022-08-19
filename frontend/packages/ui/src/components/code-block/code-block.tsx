import IcoClipboard24 from 'icons/ico/ico-clipboard-24';
import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import styled, { css, useTheme } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import Tooltip from '../tooltip';
import Typography from '../typography';

export type CodeBlockProps = {
  language: string;
  children: string;
  buttonAriaLabel?: string;
  testID?: string;
  tooltipText?: string;
  tooltipTextConfirmation?: string;
};

const HIDE_TIMEOUT = 600;

let confirmationTimeout: null | NodeJS.Timeout = null;

const CodeBlock = ({
  language,
  children,
  buttonAriaLabel = 'Copy to clipboard',
  testID,
  tooltipText = 'Copy to clipboard',
  tooltipTextConfirmation = 'Copied!',
}: CodeBlockProps) => {
  const theme = useTheme();
  const [shouldShowConfirmation, setShowConfirmation] = useState(false);

  useEffect(
    () => () => {
      clearTooltipTimeout();
    },
    [],
  );

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowConfirmation(true);
    scheduleToHideConfirmation();
    navigator.clipboard.writeText(children);
  };

  const clearTooltipTimeout = () => {
    if (confirmationTimeout) {
      clearTimeout(confirmationTimeout);
      confirmationTimeout = null;
    }
  };

  const scheduleToHideConfirmation = () => {
    confirmationTimeout = setTimeout(() => {
      setShowConfirmation(false);
    }, HIDE_TIMEOUT);
  };

  return (
    <Container>
      <Header>
        <Typography variant="label-3">{language}</Typography>
        <Tooltip
          placement="left"
          size="compact"
          text={shouldShowConfirmation ? tooltipTextConfirmation : tooltipText}
        >
          <CopyButton
            onClick={handleCopy}
            aria-label={buttonAriaLabel}
            data-testid={testID}
            type="button"
          >
            <IcoClipboard24 />
          </CopyButton>
        </Tooltip>
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
    border-radius: ${theme.borderRadius[2]}px;
    overflow: hidden;
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    height: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    width: 100%;
    padding: ${theme.spacing[5]}px;
  `}
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin: 0;
  padding: 0;
`;

const Content = styled.code`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[5]}px;
    width: 100%;
    ${createFontStyles('snippet-2')};

    pre {
      background: none !important;
      padding: 0 !important;
    }
  `}
`;

export default CodeBlock;
