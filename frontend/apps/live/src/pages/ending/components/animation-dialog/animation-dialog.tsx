import { IcoCheck24 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import Rive from '@rive-app/react-canvas';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import Sparkles from '../sparkles';

const ID_ANIMATION_DURATION = 2500;
const SUCCESS_ANIMATION_DURATION = 2000;
const END_MESSAGE_DURATION = 6000;

const messageVariants = {
  initial: {
    display: 'none',
    opacity: 0,
    y: 20,
  },
  animate: {
    display: 'flex',
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  },
  exit: {
    display: 'none',
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.4,
      ease: 'easeIn',
    },
  },
};

type AnimationDialogContentProps = {
  onClose: () => void;
};

const AnimationDialog = ({ onClose }: AnimationDialogContentProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'ending' });
  const [showIdAnimation, setShowIdAnimation] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEndMessage, setShowEndMessage] = useState(false);

  useTimeout(() => {
    setShowIdAnimation(false);
    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false);
      setShowEndMessage(true);
    }, SUCCESS_ANIMATION_DURATION);

    setTimeout(() => {
      setShowSuccessMessage(false);
      onClose();
    }, END_MESSAGE_DURATION);
  }, ID_ANIMATION_DURATION);

  return (
    <>
      <AnimatePresence>
        {showIdAnimation && (
          <AnimationContainer variants={messageVariants} initial="initial" animate="animate" exit="exit">
            <IconContainer>
              <Rive src="/animations/face-id.riv" />
            </IconContainer>
            <Text tag="p" variant="label-4" color="secondary" marginTop={4}>
              {t('animation.validating-biometrics')}
            </Text>
          </AnimationContainer>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSuccessMessage && (
          <AnimationContainer variants={messageVariants} initial="initial" animate="animate" exit="exit">
            <IcoCheck24 />
            <Text tag="p" variant="label-4" color="secondary" marginTop={4}>
              {t('animation.success')}
            </Text>
          </AnimationContainer>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEndMessage && (
          <Sparkles color="#76FB8F">
            <AnimationContainer variants={messageVariants} initial="initial" animate="animate" exit="exit">
              <Text tag="p" variant="label-3" color="secondary">
                {t('animation.end')}
              </Text>
            </AnimationContainer>
          </Sparkles>
        )}
      </AnimatePresence>
    </>
  );
};

const AnimationContainer = styled(motion.div)`
  ${({ theme }) => css`
    padding: ${theme.spacing[6]} ${theme.spacing[8]} ${theme.spacing[5]}
      ${theme.spacing[8]};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 180px;
    text-align: center;
  `};
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
`;

export default AnimationDialog;
