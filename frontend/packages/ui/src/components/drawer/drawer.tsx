import type { Icon } from '@onefootprint/icons';
import { IcoClose24 } from '@onefootprint/icons';
import * as RadixDialog from '@radix-ui/react-dialog';

import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import { media } from '../../utils';
import Box from '../box';
import Overlay from '../overlay';
import Footer from './components/footer';
import Header from './components/header';

type DrawerButton = {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  form?: string;
  type?: 'button' | 'submit' | 'reset';
};

export type DrawerProps = {
  children?: React.ReactNode;
  headerComponent?: React.ReactNode;
  closeAriaLabel?: string;
  open?: boolean;
  title: string;
  description?: string;
  closeIconComponent?: Icon;
  onClose: () => void;
  onClickOutside?: () => void;
  primaryButton?: DrawerButton;
  secondaryButton?: DrawerButton;
  linkButton?: {
    label: string;
    onClick: () => void;
  };
};

const Drawer = ({
  children,
  closeAriaLabel,
  open,
  title,
  headerComponent,
  closeIconComponent: CloseIconComponent = IcoClose24,
  onClickOutside,
  onClose,
  primaryButton,
  secondaryButton,
  linkButton,
}: DrawerProps) => {
  const { t } = useTranslation('ui');

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
    }
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={handleOpenChange}>
      <RadixDialog.Portal>
        <DrawerSurface onEscapeKeyDown={onClose} onPointerDownOutside={onClickOutside} aria-describedby={undefined}>
          <Header
            closeAriaLabel={closeAriaLabel ?? t('components.drawer.close-aria-label-default')}
            closeIconComponent={CloseIconComponent}
            onClose={onClose}
          >
            {title}
          </Header>
          {headerComponent}
          <Box padding={7} overflow="auto" maxWidth="100%">
            {children}
          </Box>
          <Footer linkButton={linkButton} secondaryButton={secondaryButton} primaryButton={primaryButton} />
        </DrawerSurface>
        <RadixDialog.Overlay asChild>
          <Overlay isVisible={open} />
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
`;

const DrawerSurface = styled(RadixDialog.Content)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
    z-index: ${theme.zIndex.drawer};
    isolation: isolate;
    width: 500px;
    height: calc(100vh - 2 * ${theme.spacing[3]});
    top: ${theme.spacing[3]};
    position: fixed;
    right: ${theme.spacing[3]};
    box-sizing: border-box;

    ${media.lessThan('sm')`
      width: 100vw;
      border-radius: 0;
    `}

    &[data-state='open'] {
      animation: ${slideIn} 0.2s ease-in;
    }

    &[data-state='closed'] {
      animation: ${slideOut} 0.2s ease-out;
    }
  `}
`;

export default Drawer;
