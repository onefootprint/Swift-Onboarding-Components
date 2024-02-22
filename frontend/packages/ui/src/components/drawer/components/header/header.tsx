import type { Icon } from '@onefootprint/icons';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import * as DrawerPrimitive from '@radix-ui/react-dialog';
import React from 'react';

import IconButton from '../../../icon-button';
import Typography from '../../../typography';

type HeaderProps = {
  closeAriaLabel?: string;
  closeIconComponent?: Icon;
  onClose: () => void;
  children: string;
};

const Header = ({
  closeAriaLabel = 'Close',
  closeIconComponent: CloseIconComponent = IcoClose24,
  onClose,
  children,
}: HeaderProps) => (
  <Container>
    <CloseContainer>
      <DrawerPrimitive.Close asChild>
        <IconButton aria-label={closeAriaLabel} onClick={onClose}>
          <CloseIconComponent />
        </IconButton>
      </DrawerPrimitive.Close>
    </CloseContainer>
    <DrawerPrimitive.Title asChild>
      <Typography variant="label-2" as="h2">
        {children}
      </Typography>
    </DrawerPrimitive.Title>
  </Container>
);

export default Header;

const Container = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    justify-content: center;
    padding: 0 ${theme.spacing[10]};
    height: 52px;
    position: relative;

    h2 {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[5]};
  `}
`;
