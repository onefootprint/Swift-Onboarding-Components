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
  truncate,
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

  return disable ? (
    <CodeContent data-truncate={truncate}>{children}</CodeContent>
  ) : (
    <Tooltip
      placement="right"
      size="compact"
      text={shouldShowConfirmation ? tooltipTextConfirmation : tooltipText}
    >
      <Button
        aria-label={buttonAriaLabel}
        data-testid={testID}
        data-truncate={truncate}
        onClick={disable ? undefined : handleClick}
        type="button"
      >
        <CodeContent data-truncate={truncate}>{children}</CodeContent>
      </Button>
    </Tooltip>
  );
};

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin: 0;
  padding: 0;

  &[data-truncate='true'] {
    width: 100%;
  }
`;

const CodeContent = styled.code`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')};
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.compact};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    color: ${theme.color.error};
    display: inline-block;
    flex-flow: wrap;
    height: 24px;
    height: auto;
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
    text-align: left;
    white-space: break-spaces;
    word-break: break-word;

    &[data-truncate='true'] {
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      word-break: unset;
    }
  `}
`;

export default CodeInline;
