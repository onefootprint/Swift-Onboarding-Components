'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import type React from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import { media } from '../../utils';
import Box from '../box';
import Overlay from '../overlay';
import ScrollArea from '../scroll-area';
import Stack from '../stack';
import Header, { HEADER_HEIGHT } from './header';

export type BottomSheetProps = {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
  closeAriaLabel?: string;
  containerId?: string;
  portalId?: string;
};

const BottomSheet = ({
  open = false,
  onClose,
  children,
  title,
  closeAriaLabel,
  containerId,
  portalId = 'footprint-footer',
}: BottomSheetProps) => {
  const { t } = useTranslation('ui');
  const portalRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const PADDING_TOP = 40;
  const containerHeight = containerRef.current?.clientHeight;
  const componentMaxHeight = containerHeight ? `${containerHeight - PADDING_TOP}px` : undefined;
  const scrollAreaMaxHeight = containerHeight ? `${containerHeight - HEADER_HEIGHT - PADDING_TOP}px` : undefined;

  useEffect(() => {
    if (portalId) {
      portalRef.current = document.getElementById(portalId);
    }
  }, [portalId]);

  useEffect(() => {
    if (containerId) {
      containerRef.current = document.getElementById(containerId);
    }
  }, [containerId]);

  useEffect(() => {
    if (open === true) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [open]);

  return (
    <RadixDialog.Root open={open} onOpenChange={onClose}>
      <RadixDialog.Portal container={portalRef.current || undefined}>
        <RadixDialog.Content onPointerDownOutside={onClose} aria-describedby={undefined} asChild>
          <Content>
            <RadixDialog.Title asChild>
              <VisuallyHidden>{title}</VisuallyHidden>
            </RadixDialog.Title>
            <Stack maxHeight={componentMaxHeight} direction="column">
              <Header
                // @ts-ignore - Type instantiation is excessively deep and possibly infinite
                closeAriaLabel={closeAriaLabel ?? (t('components.bottom-sheet.close-aria-label-default') as string)}
                onClose={onClose}
                title={title}
              />
              <ScrollArea hideBottomLine padding={5} maxHeight={scrollAreaMaxHeight}>
                {children}
              </ScrollArea>
            </Stack>
          </Content>
        </RadixDialog.Content>
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
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(100%);
  }
`;

const Content = styled(Box)`
  ${({ theme }) => css`
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
    z-index: ${theme.zIndex.bottomSheet};
    align-self: end;

    &[data-state='open'] {
      animation: ${slideIn} 0.3s ease-in-out;
    }

    &[data-state='closed'] {
      animation: ${slideOut} 0.35s ease-in-out;
    }

    ${media.greaterThan('md')`
      position: absolute;
    `}
  `}
`;

export default BottomSheet;
