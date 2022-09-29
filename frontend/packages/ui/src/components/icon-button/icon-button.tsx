import type { Icon } from '@onefootprint/icons';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createOverlayBackground } from '../../utils/mixins';

export type IconButtonProps = {
  'aria-label': string;
  iconComponent: Icon;
  onClick?: () => void;
  disabled?: boolean;
  testID?: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      'aria-label': ariaLabel,
      iconComponent: Icon,
      onClick,
      disabled,
      testID,
    }: IconButtonProps,
    ref,
  ) => (
    <Container
      aria-label={ariaLabel}
      data-testid={testID}
      onClick={onClick}
      ref={ref}
      tabIndex={0}
      type="button"
      disabled={disabled}
    >
      <Icon color="primary" />
    </Container>
  ),
);

const Container = styled.button`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: 32px;

  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[4]}px;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:enabled {
    ${createOverlayBackground('darken-1', 'primary')};
  }

  &:active:enabled {
    ${createOverlayBackground('darken-2', 'primary')};
  }
`;

export default IconButton;
