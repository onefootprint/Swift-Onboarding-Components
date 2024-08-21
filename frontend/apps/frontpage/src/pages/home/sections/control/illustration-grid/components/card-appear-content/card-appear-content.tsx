import { IcoCloseSmall16 } from '@onefootprint/icons';
import { Divider, Stack, createFontStyles } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

const cardVariants = {
  initial: { height: 0, filter: 'blur(5px)' },
  visible: {
    height: 'auto',
    filter: 'blur(0)',
    transition: { duration: 0.1, ease: 'easeInOut' },
  },
  exit: {
    height: 0,
    filter: 'blur(5px)',
    transition: { duration: 0.1, ease: 'easeInOut' },
  },
};

type CardAppearContentProps = {
  isVisible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
};

const CardAppearContent = ({ isVisible, children, onClose }: CardAppearContentProps) => {
  const [localVisible, setLocalVisible] = useState(isVisible);

  useEffect(() => {
    setLocalVisible(isVisible);
  }, [isVisible]);

  const handleClose = () => {
    setLocalVisible(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {localVisible && (
        <Stack gap={5} direction="column">
          <Divider variant="secondary" />
          <Container initial="initial" animate="visible" exit="exit" variants={cardVariants} position="relative">
            {onClose && (
              <CloseButton onClick={handleClose}>
                <IcoCloseSmall16 color="tertiary" />
              </CloseButton>
            )}
            {children}
          </Container>
        </Stack>
      )}
    </AnimatePresence>
  );
};

const Container = styled(motion(Stack))`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.secondary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const CloseButton = styled.button`
  ${({ theme }) => css`
    all: unset;
    position: absolute;
    top: -${theme.spacing[3]};
    right: 0;
    cursor: pointer;
  `}
`;

export default CardAppearContent;
