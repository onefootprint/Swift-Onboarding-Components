import { useOnClickOutside } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { IconButton, Overlay, Stack } from '@onefootprint/ui';
import FocusTrap from 'focus-trap-react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export type IdvBottomSheetProps = {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  closeAriaLabel?: string;
  containerId?: string;
};

const HEADER_HEIGHT = 52;
const TOP_SHEET_OFFSET = 40;

const IdvBottomSheet = ({
  open,
  onClose,
  children,
  closeAriaLabel = 'Close',
  containerId,
}: IdvBottomSheetProps) => {
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(bottomSheetRef, () => {
    if (open) {
      onClose?.();
    }
  });

  const [layoutContainerHeight, setLayoutContainerHeight] = useState(0);
  const [customBottom, setCustomBottom] = useState('');
  const maxSheetHeight = layoutContainerHeight - TOP_SHEET_OFFSET;
  const maxContentHeight = `${maxSheetHeight - HEADER_HEIGHT}px`;

  useEffect(() => {
    const body = document.querySelector(`#${containerId}`);

    const checkSize = () => {
      const layoutContainer =
        containerId && document.getElementById(containerId);
      if (!layoutContainer) return;
      setLayoutContainerHeight(layoutContainer.clientHeight);
      // to align the bottom of the sheet to the bottom of the iframe properly
      const bottomShift =
        layoutContainer.scrollHeight - layoutContainer.clientHeight;
      setCustomBottom(`${bottomShift}px`);
    };

    const startResizeObserve = () => {
      if (body) new ResizeObserver(checkSize).observe(body);
    };

    const stopResizeObserve = () => {
      if (body) new ResizeObserver(checkSize).unobserve(body);
    };

    startResizeObserve();

    return stopResizeObserve;
  }, [containerId]);

  const motionVariants = {
    visible: {
      opacity: 1,
      transform: 'translateY(0)',
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
    initial: {
      opacity: 0,
      transform: 'translateY(50%)',
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
    exit: {
      opacity: 1,
      transform: 'translateY(50%)',
      transition: {
        duration: 0.1,
        ease: 'easeInOut',
      },
    },
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <FocusTrap active={open}>
            <span>
              <Sheet
                variants={motionVariants}
                animate="visible"
                initial="initial"
                exit="initial"
                role="dialog"
                key="bottom-sheet"
                ref={bottomSheetRef}
                maxSheetHeight={`${layoutContainerHeight - TOP_SHEET_OFFSET}px`}
                customBottom={customBottom}
              >
                <Stack
                  height="52px"
                  flexGrow={0}
                  align="center"
                  justify="space-between"
                  paddingLeft={3}
                >
                  <IconButton aria-label={closeAriaLabel} onClick={onClose}>
                    <IcoClose24 />
                  </IconButton>
                </Stack>
                <ScrollArea maxContentHeight={maxContentHeight}>
                  {children}
                </ScrollArea>
              </Sheet>
            </span>
          </FocusTrap>
        )}
      </AnimatePresence>
      <Overlay isVisible={open} />
    </>
  );
};

const Sheet = styled(motion.span)<{
  maxSheetHeight?: string;
  customBottom?: string;
}>`
  ${({ theme, maxSheetHeight, customBottom }) => css`
    z-index: ${theme.zIndex.bottomSheet};
    max-height: ${maxSheetHeight};
    position: absolute;
    bottom: ${customBottom || '0'};
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;
    box-shadow: ${theme.elevation[3]};
  `}
`;

const ScrollArea = styled.div<{ maxContentHeight: string }>`
  ${({ theme, maxContentHeight }) => css`
    overflow: hidden;
    overflow-y: auto;
    max-height: ${maxContentHeight};
    padding: ${theme.spacing[3]} ${theme.spacing[7]} ${theme.spacing[7]}
      ${theme.spacing[7]};
  `}
`;

export default IdvBottomSheet;
