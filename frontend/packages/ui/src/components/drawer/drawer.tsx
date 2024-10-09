import type { Icon } from '@onefootprint/icons';
import { IcoClose24 } from '@onefootprint/icons';
import * as DrawerPrimitive from '@radix-ui/react-dialog';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import { media } from '../../utils';
import Box from '../box';
import Button from '../button';
import LinkButton from '../link-button';
import Overlay from '../overlay';
import Stack from '../stack';
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

const FOOTER_HEIGHT = '56px';

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
    <DrawerPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DrawerPrimitive.Portal>
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
          {(primaryButton || secondaryButton || linkButton) && (
            <Footer justify="space-between" align="center" tag="footer">
              <Stack flex={1}>
                {linkButton && <LinkButton onClick={linkButton.onClick}>{linkButton.label}</LinkButton>}
              </Stack>
              <Stack direction="row" gap={3}>
                {secondaryButton && (
                  <Button
                    form={secondaryButton.form}
                    loading={secondaryButton.loading}
                    onClick={secondaryButton.onClick}
                    type={secondaryButton.type}
                    variant="secondary"
                  >
                    {secondaryButton.label}
                  </Button>
                )}
                {primaryButton && (
                  <Button
                    form={primaryButton.form}
                    loading={primaryButton.loading}
                    onClick={primaryButton.onClick}
                    type={primaryButton.type}
                    variant="primary"
                  >
                    {primaryButton.label}
                  </Button>
                )}
              </Stack>
            </Footer>
          )}
        </DrawerSurface>
        <DrawerPrimitive.Overlay asChild>
          <Overlay isVisible={open} />
        </DrawerPrimitive.Overlay>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
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

const DrawerSurface = styled(DrawerPrimitive.Content)`
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

const Footer = styled(Stack)`
  ${({ theme }) => css`
    bottom: 0;
    z-index: ${theme.zIndex.drawer};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[4]} ${theme.spacing[7]};
    height: ${FOOTER_HEIGHT};
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
  `}
`;

export default Drawer;
