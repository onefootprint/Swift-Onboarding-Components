import type { Icon as TIcon } from 'icons';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled';

import { createOverlayBackground } from '../../utils/mixins';

export type IconButtonProps = {
  ariaLabel: string;
  Icon: TIcon;
  onClick?: () => void;
  testID?: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ ariaLabel, Icon, onClick, testID }: IconButtonProps, ref) => (
    <Container
      aria-label={ariaLabel}
      data-testid={testID}
      onClick={onClick}
      ref={ref}
      tabIndex={0}
      type="button"
    >
      <Icon color="primary" />
    </Container>
  ),
);

const Container = styled.button`
  align-items: center;
  border: none;
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: 32px;
  background: none;
  border: none;

  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[3]}px;

    &:hover:enabled {
      ${createOverlayBackground('darken-1', 'primary')};
    }

    &:active:enabled {
      ${createOverlayBackground('darken-2', 'primary')};
    }
  `}
`;

export default IconButton;
