import type { Icon } from '@onefootprint/icons';
import { IcoClose24 } from '@onefootprint/icons';
import * as DrawerPrimitive from '@radix-ui/react-dialog';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import type { SXStyles } from '../../hooks';
import { media } from '../../utils';
import Box from '../box';
import Button from '../button';
import LinkButton from '../link-button';
import Overlay from '../overlay';
import ScrollArea from '../scroll-area';
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
      <DrawerContainer onEscapeKeyDown={onClose} onPointerDownOutside={onClickOutside} role="dialog">
        <DrawerSurface>
          <Header
            closeAriaLabel={closeAriaLabel ?? t('components.drawer.close-aria-label-default')}
            closeIconComponent={CloseIconComponent}
            onClose={onClose}
          >
            {title}
          </Header>
          {headerComponent}
          <Body padding={7} hideBottomLine hideTopLine>
            {children}
          </Body>
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
      </DrawerContainer>
      <DrawerPrimitive.Overlay asChild>
        <Overlay isVisible={open} />
      </DrawerPrimitive.Overlay>
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

const DrawerSurface = styled(Box)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
    isolation: isolate;
  `}
`;

const DrawerContainer = styled(DrawerPrimitive.Content)<{ sx?: SXStyles }>`
  ${({ theme, sx }) => css`
    height: 100vh;
    width: calc(500px + 2 * ${theme.spacing[3]});
    position: fixed;
    right: 0;
    top: 0;
    padding: ${theme.spacing[3]};
    z-index: ${theme.zIndex.drawer};

    ${media.lessThan('sm')`
      width: 100vw;
      height: 100vh;
      border-radius: 0;
    `}

    &[data-state='open'] {
      animation: ${slideIn} 0.2s ease-in;
    }

    &[data-state='closed'] {
      animation: ${slideOut} 0.2s ease-out;
    }

    ${sx};
  `}
`;

const Body = styled(ScrollArea)`
    flex: 1;
`;

const Footer = styled(Stack)`
  ${({ theme }) => css`
    bottom: 0;
    z-index: ${theme.zIndex.drawer};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[4]} ${theme.spacing[7]};
    height: ${FOOTER_HEIGHT};
  `}
`;

export default Drawer;
