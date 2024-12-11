'use client';

import { IcoCopy16, IcoCopy24 } from '@onefootprint/icons';
import type React from 'react';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { IconButton } from '../index';
import type { TooltipProps } from '../tooltip';
import Tooltip from '../tooltip';

export type CopyButtonProps = {
  ariaLabel?: string;
  disable?: boolean;
  children?: string | React.ReactNode;
  contentToCopy: string;
  size?: 'default' | 'large' | 'compact';
  tooltip?: {
    position?: TooltipProps['position'];
    alignment?: TooltipProps['alignment'];
    text?: string;
    textConfirmation?: string;
  };
};

const HIDE_TIMEOUT = 600;

let confirmationTimeout: null | ReturnType<typeof setTimeout> = null;

const CopyButton = ({
  ariaLabel,
  size = 'default',
  tooltip = {
    position: 'right',
    alignment: 'center',
    text: 'Copy to clipboard',
    textConfirmation: 'Copied!',
  },
  children,
  disable,
  contentToCopy,
}: CopyButtonProps) => {
  const { t } = useTranslation('ui');
  const [shouldShowConfirmation, setShowConfirmation] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const CopyIcon = size === 'large' ? IcoCopy24 : IcoCopy16;

  useEffect(
    () => () => {
      clearTooltipTimeout();
    },
    [],
  );

  const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
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
    const tooltipText = tooltip.text ?? (t('components.copy-button.tooltip-text-default') as string);
    const tooltipTextConfirmation =
      tooltip.textConfirmation ?? (t('components.copy-button.tooltip-text-confirmation-default') as string);
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
      position={tooltip.position}
      alignment="center"
      text={handleText()}
      disabled={disable}
      open={isTooltipVisible}
      onOpenChange={setTooltipVisible}
      asChild
    >
      {children ? (
        <Button
          aria-label={ariaLabel ?? (t('components.copy-button.aria-label-default') as string)}
          type="button"
          disabled={disable}
          onClick={handleClick}
        >
          {children}
        </Button>
      ) : (
        <IconButton
          aria-label={ariaLabel ?? (t('components.copy-button.aria-label-default') as string)}
          disabled={disable}
          onClick={handleClick}
          size={size}
        >
          <CopyIcon color={disable ? 'tertiary' : undefined} />
        </IconButton>
      )}
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
