import { IcoClipboard24 } from 'icons';
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

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    width: 100%;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `}
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;

  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')};
    background: transparent;
    position: relative;
    width: 100%;

    &::before,
    &::after {
      pointer-events: none;
      content: '';
      position: absolute;
      top: 0px;
      bottom: ${theme.spacing[3]}px;
    }

    &::before {
      left: 0px;
      width: ${theme.spacing[5]}px;
      background: linear-gradient(
        -90deg,
        rgba(255, 255, 255, 0),
        ${theme.backgroundColor.primary}
      );
    }

    &::after {
      right: 0px;
      width: ${theme.spacing[7]}px;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        ${theme.backgroundColor.primary} 80%
      );
    }

    pre {
      text-align: left;
      padding: ${theme.spacing[5]}px !important;
      background: none !important;
    }
  `}
`;

export default CodeBlock;
