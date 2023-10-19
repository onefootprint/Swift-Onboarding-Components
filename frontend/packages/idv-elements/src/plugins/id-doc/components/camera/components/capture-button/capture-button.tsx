import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React from 'react';

const DEFAULT_OUTER_RADIUS = 72;
const DEFAULT_INNER_RADIUS = 56;

type CaptureButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  variant: 'default' | 'round';
};

const CaptureButton = ({
  onClick,
  disabled = false,
  variant,
}: CaptureButtonProps) => (
  <>
    {variant === 'default' && (
      <Button
        fullWidth
        aria-disabled={disabled}
        data-disabled={disabled}
        onClick={onClick}
        disabled={disabled}
      >
        Take photo
      </Button>
    )}
    {variant === 'round' && (
      <RoundButton
        aria-disabled={disabled}
        data-disabled={disabled}
        onClick={onClick}
        outerRadius={DEFAULT_OUTER_RADIUS}
      >
        <InnerCircle
          aria-disabled={disabled}
          data-disabled={disabled}
          innerRadius={DEFAULT_INNER_RADIUS}
        />
      </RoundButton>
    )}
  </>
);

const RoundButton = styled.div<{
  outerRadius: number;
}>`
  ${({ theme, outerRadius }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${outerRadius}px;
    width: ${outerRadius}px;
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

    &:hover {
      cursor: pointer;
    }
  `}
`;

const InnerCircle = styled.button<{
  innerRadius: number;
}>`
  ${({ theme, innerRadius }) => css`
    height: ${innerRadius}px;
    width: ${innerRadius}px;
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

export default CaptureButton;
