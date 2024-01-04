import { IcoClose24 } from '@onefootprint/icons';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import React from 'react';
import styled, { css } from 'styled-components';

import IconButton from '../../icon-button';
import Stack from '../../stack';
import Typography from '../../typography';

export const HEADER_HEIGHT = 52;

type HeaderProps = {
  title?: string;
  closeAriaLabel?: string;
  onClose?: () => void;
};

const Header = ({ title, closeAriaLabel = 'Close', onClose }: HeaderProps) => (
  <Container hasBorder={!!title} flexGrow={0}>
    <DialogPrimitive.Close asChild>
      <Stack align="center" justify="center" height="100%">
        <IconButton aria-label={closeAriaLabel} onClick={onClose}>
          <IcoClose24 />
        </IconButton>
      </Stack>
    </DialogPrimitive.Close>
    {title && (
      <DialogPrimitive.Title asChild>
        <Typography variant="label-2">{title}</Typography>
      </DialogPrimitive.Title>
    )}
  </Container>
);

const Container = styled(Stack)<{ hasBorder: boolean }>`
  ${({ theme, hasBorder }) => css`
    height: 52px;
    display: flex;
    align-items: start;
    justify-content: start;
    padding: ${theme.spacing[3]};

    ${hasBorder &&
    css`
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    `}
  `}
`;

export default Header;
