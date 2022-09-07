import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import Tooltip from '../tooltip';

export type CodeInlineProps = {
  buttonAriaLabel?: string;
  children: string;
  disable?: boolean;
  testID?: string;
  tooltipText?: string;
  tooltipTextConfirmation?: string;
  truncate?: boolean;
};

const HIDE_TIMEOUT = 600;

let confirmationTimeout: null | NodeJS.Timeout = null;

const CodeInline = ({
  buttonAriaLabel = 'Copy to clipboard',
  children,
  disable,
  testID,
  tooltipText = 'Copy to clipboard',
  tooltipTextConfirmation = 'Copied!',
  truncate = false,
}: CodeInlineProps) => {
  const [shouldShowConfirmation, setShowConfirmation] = useState(false);

  useEffect(
    () => () => {
      clearTooltipTimeout();
    },
    [],
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
    <Tooltip
      disabled={disable}
      placement="right"
      size="compact"
      text={shouldShowConfirmation ? tooltipTextConfirmation : tooltipText}
    >
      <Button
        aria-label={buttonAriaLabel}
        data-testid={testID}
        onClick={disable ? undefined : handleClick}
        type="button"
        className={disable ? 'disabled' : undefined}
      >
        <CodeContent truncate={truncate}>{children}</CodeContent>
      </Button>
    </Tooltip>
  );
};

const Button = styled.button`
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &.disabled {
    cursor: text;
  }
`;

const CodeContent = styled.code<{ truncate?: boolean }>`
  ${({ theme, truncate }) => css`
    ${createFontStyles('snippet-2')};
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    color: ${theme.color.error};
    display: block;
    height: 24px;
    padding: ${theme.spacing[1]}px ${theme.spacing[2]}px;
    white-space: break-spaces;
    flex-flow: wrap;
    height: auto;
    text-align: left;
    word-break: break-word;

    ${truncate &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: unset;
    `}
  `}
`;

export default CodeInline;
