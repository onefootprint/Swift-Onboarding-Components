import { IcoCloseSmall16 } from '@onefootprint/icons';
import { Stack, Text, media } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type WhatIsThisCardProps = {
  $isVisible: boolean;
  onClose: () => void;
};
const cardAppearVariants = {
  initial: {
    x: '-50%',
    y: '-50%',
    left: '50%',
    bottom: '-25%',
    opacity: 0,
  },
  animate: {
    opacity: 1,
    bottom: '0%',
  },
  exit: {
    opacity: 0,
    bottom: '-25%',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const blurAppearVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
  },
};

const WhatIsThisCard = ({ $isVisible, onClose }: WhatIsThisCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.behavior-and-device-insights.illustration.app-clip.what-is-this',
  });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      {$isVisible && (
        <>
          <CardContainer variants={cardAppearVariants} initial="initial" animate="animate" exit="exit">
            <IconContainer onClick={onClose} aria-label="Close">
              <IcoCloseSmall16 />
            </IconContainer>
            <Text variant="label-2">{t('title')}</Text>
            <Text variant="body-2" color="secondary">
              {t('description')}
            </Text>
          </CardContainer>
          <BlurBackground variants={blurAppearVariants} initial="initial" animate="animate" exit="exit" />
        </>
      )}
    </AnimatePresence>
  );
};

const CardContainer = styled(motion(Stack))`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.lg};
    overflow: hidden;
    padding: ${theme.spacing[7]};
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(5px);
    position: absolute;
    box-shadow: ${theme.elevation[1]};
    flex-direction: column;
    gap: ${theme.spacing[4]};
    z-index: 10;
    width: 90%;

    ${media.greaterThan('md')`
      width: 460px;
    `}
  `}
`;

const IconContainer = styled.button`
  ${({ theme }) => css`
    all: unset;
    position: absolute;
    width: fit-content;
    top: ${theme.spacing[4]};
    right: ${theme.spacing[4]};
  `}
`;

const BlurBackground = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    width: calc(100% - 2px);
    height: 250%;
    top: -100%;
    left: 1px;
    background-color: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 2;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `}
`;

export default WhatIsThisCard;
