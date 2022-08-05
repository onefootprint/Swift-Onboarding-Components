import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import Tooltip from '../tooltip';

export type CodeProps = {
  buttonAriaLabel?: string;
  children: string;
  testID?: string;
  tooltipText?: string;
  tooltipTextConfirmation?: string;
};

const HIDE_TIMEOUT = 600;

let confirmationTimeout: null | NodeJS.Timeout = null;

const Code = ({
  buttonAriaLabel = 'Copy to clipboard',
  children,
  testID,
  tooltipText = 'Copy to clipboard',
  tooltipTextConfirmation = 'Copied!',
}: CodeProps) => {
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
      placement="right"
      size="compact"
      text={shouldShowConfirmation ? tooltipTextConfirmation : tooltipText}
    >
      <Button
        aria-label={buttonAriaLabel}
        data-testid={testID}
        onClick={handleClick}
        type="button"
      >
        <CodeContent>{children}</CodeContent>
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
`;

const CodeContent = styled.code`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')};
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    color: ${theme.color.error};
    display: block;
    height: 24px;
    overflow: hidden;
    padding: ${theme.spacing[1]}px ${theme.spacing[2]}px;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
`;

export default Code;
