'use client';

import { IcoCopy16, IcoCopy24 } from '@onefootprint/icons';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

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
  size?: 'small' | 'default';
};

const HIDE_TIMEOUT = 600;

let confirmationTimeout: null | ReturnType<typeof setTimeout> = null;

const CopyButton = ({
  ariaLabel,
  size = 'default',
  tooltipPosition = 'right',
  tooltipText,
  tooltipTextConfirmation,
  children,
  disable,
  contentToCopy,
}: CopyButtonProps) => {
  const { t } = useTranslation('ui');
  const [shouldShowConfirmation, setShowConfirmation] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const CopyIcon = size === 'small' ? IcoCopy16 : IcoCopy24;

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
    const tooltip = tooltipText ?? t('components.copy-button.tooltip-text-default');
    const confirmation = tooltipTextConfirmation ?? t('components.copy-button.tooltip-text-confirmation-default');
    if (isMobile) {
      return confirmation;
    }
    return shouldShowConfirmation ? confirmation : tooltip;
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
        aria-label={ariaLabel ?? t('components.copy-button.aria-label-default')}
        type="button"
        disabled={disable}
        onClick={handleClick}
      >
        {children || <CopyIcon color={disable ? 'tertiary' : undefined} />}
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
