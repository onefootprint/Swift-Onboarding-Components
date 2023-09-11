import { IcoCopy24 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';

import type { TooltipProps } from '../tooltip';
import Tooltip from '../tooltip';

export type CopyButtonProps = {
  ariaLabel?: string;
  disable?: boolean;
  tooltipPosition?: TooltipProps['position'];
  tooltipText?: string;
  tooltipTextConfirmation?: string;
  children?: string | React.ReactNode;
  contentToCopy: string;
};

const HIDE_TIMEOUT = 600;

let confirmationTimeout: null | NodeJS.Timeout = null;

const CopyButton = ({
  ariaLabel = 'Copy to clipboard',
  tooltipPosition = 'right',
  tooltipText = 'Copy to clipboard',
  tooltipTextConfirmation = 'Copied!',
  children,
  disable,
  contentToCopy,
}: CopyButtonProps) => {
  const [shouldShowConfirmation, setShowConfirmation] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);

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
    navigator.clipboard.writeText(contentToCopy);
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

  const handleText = () => {
    if (isMobile) {
      return tooltipTextConfirmation;
    }
    return shouldShowConfirmation ? tooltipTextConfirmation : tooltipText;
  };

  useEffect(() => {
    setTooltipVisible(shouldShowConfirmation);
  }, [shouldShowConfirmation]);

  return (
    <Tooltip
      position={tooltipPosition}
      alignment="center"
      text={handleText()}
      disabled={disable}
      open={isTooltipVisible}
      onOpenChange={setTooltipVisible}
    >
      <Button
        aria-label={ariaLabel}
        type="button"
        disabled={disable}
        onClick={handleClick}
      >
        {children || <IcoCopy24 color={disable ? 'tertiary' : undefined} />}
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
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;

  &[data-truncate='true'] {
    max-width: 100%;
  }

  &:disabled {
    pointer-events: none;
  }
`;

export default CopyButton;
