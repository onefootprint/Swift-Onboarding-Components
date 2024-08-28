import type { Icon } from '@onefootprint/icons';
import type React from 'react';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createOverlayBackground } from '../../utils/mixins';

export type IconButtonProps = {
  'aria-label': string;
  children: React.ReactElement<Icon>;
  onClick?: () => void;
  disabled?: boolean;
  testID?: string;
  width?: string;
  height?: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 'aria-label': ariaLabel, children, onClick, disabled, testID, width, height }: IconButtonProps, ref) => (
    <Container
      aria-label={ariaLabel}
      data-testid={testID}
      onClick={onClick}
      ref={ref}
      tabIndex={0}
      type="button"
      disabled={disabled}
      $width={width}
      $height={height}
    >
      {children}
    </Container>
  ),
);

const Container = styled.button<{ $width?: string; $height?: string }>`
  ${({ $width, $height }) => css`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
    margin: 0;
    padding: 0;
    height: ${$height || '32px'};
    width: ${$width || '32px'};
  `}

  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
  `}

  &:disabled {
    cursor: initial;
    opacity: 0.5;
  }

  @media (hover: hover) {
    &:hover:enabled {
      ${createOverlayBackground('darken-1', 'primary')};
    }
  }

  &:active:enabled {
    ${createOverlayBackground('darken-2', 'primary')};
  }
`;

export default IconButton;
