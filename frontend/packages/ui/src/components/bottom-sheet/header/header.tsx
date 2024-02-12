import { IcoClose24 } from '@onefootprint/icons';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import React from 'react';
import styled, { css } from 'styled-components';

import Box from '../../box';
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
      <IconButton aria-label={closeAriaLabel} onClick={onClose}>
        <IcoClose24 />
      </IconButton>
    </DialogPrimitive.Close>
    {title && (
      <Title>
        <Typography variant="label-2">{title}</Typography>
      </Title>
    )}
    <Box height="32px" width="32px" as="span" />
  </Container>
);

const Container = styled(Stack)<{ hasBorder: boolean }>`
  ${({ theme, hasBorder }) => css`
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[3]};
    width: 100%;

    ${hasBorder &&
    css`
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    `}
  `}
`;

const Title = styled(DialogPrimitive.Title)`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export default Header;
