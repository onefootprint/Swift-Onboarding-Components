import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';
import { CAPTURE_BTN_DEFAULT_INNER_RADIUS, CAPTURE_BTN_DEFAULT_OUTER_RADIUS } from '../../../../constants';

type CaptureButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  variant: 'default' | 'round' | 'stop';
};

const CaptureButton = ({ onClick, disabled = false, variant }: CaptureButtonProps) => (
  <>
    {variant === 'default' && (
      <Button
        fullWidth
        aria-disabled={disabled}
        data-disabled={disabled}
        onClick={onClick}
        disabled={disabled}
        size="large"
        data-dd-action-name="doc:take-photo"
      >
        Take photo
      </Button>
    )}
    {(variant === 'round' || variant === 'stop') && (
      <RoundButton
        aria-disabled={disabled}
        data-disabled={disabled}
        onClick={onClick}
        $outerRadius={CAPTURE_BTN_DEFAULT_OUTER_RADIUS}
        data-dd-action-name="doc:take-photo"
      >
        {variant === 'round' ? (
          <InnerCircle
            aria-disabled={disabled}
            data-disabled={disabled}
            $innerRadius={CAPTURE_BTN_DEFAULT_INNER_RADIUS}
            data-dd-action-name="doc:take-photo"
          />
        ) : (
          <InnerSquare />
        )}
      </RoundButton>
    )}
  </>
);

const RoundButton = styled.div<{ $outerRadius: number }>`
  ${({ theme, $outerRadius }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${$outerRadius}px;
    width: ${$outerRadius}px;
    background-color: none;
    border: calc(${theme.spacing[3]} - ${theme.spacing[1]}) solid
      ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    position: absolute;
    bottom: ${theme.spacing[5]};

    &[data-disabled='true'] {
      border-color: ${theme.backgroundColor.senary};
      pointer-events: none;
    }

    &[data-disabled='true'] {
      border-color: ${theme.backgroundColor.secondary};
    }

    &:hover {
      cursor: pointer;
    }
  `}
`;

const InnerCircle = styled.button<{ $innerRadius: number }>`
  ${({ theme, $innerRadius }) => css`
    height: ${$innerRadius}px;
    width: ${$innerRadius}px;
    background-color: ${theme.backgroundColor.primary};
    border: none;
    border-radius: ${theme.borderRadius.full};
    box-shadow: ${theme.elevation[2]};

    &[data-disabled='true'] {
      background-color: ${theme.backgroundColor.senary};
    }

    &:active {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const InnerSquare = styled.button`
  ${({ theme }) => css`
    height: ${theme.spacing[7]};
    width: ${theme.spacing[7]};
    background-color: ${theme.backgroundColor.primary};
    border: none;
    border-radius: ${theme.borderRadius.sm};
    box-shadow: ${theme.elevation[2]};
  `}
`;

export default CaptureButton;
