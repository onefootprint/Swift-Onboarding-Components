import type { Icon } from '@onefootprint/icons';
import { Stack, Text, createFontStyles } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import {
  firstIconVariantTransition,
  firstTextVariantTransition,
  secondIconVariantTransition,
  secondTextVariantTransition,
} from './transitions';

type GenericTransitionProps = {
  firstMessage: {
    icon: Icon;
    text: string;
  };
  secondMessage: {
    icon: Icon;
    text: string;
  };
  onAnimationEnd: () => void;
  isSecondaryBackground?: boolean;
};

const FIRST_MESSAGE_TIME = 2000;
const SECOND_MESSAGE_TIME = 4500;

const GenericTransition = ({
  firstMessage,
  secondMessage,
  onAnimationEnd,
  isSecondaryBackground,
}: GenericTransitionProps) => {
  const [animateFirstMessage, setAnimateFirstMessage] = useState(true);
  const [animateSecondMessage, setAnimateSecondMessage] = useState(false);

  useEffect(() => {
    const firstMessageTimeout = setTimeout(() => {
      setAnimateFirstMessage(false);
      setAnimateSecondMessage(true);
    }, FIRST_MESSAGE_TIME);

    const secondMessageTimeout = setTimeout(() => {
      setAnimateSecondMessage(false);
      setTimeout(() => {
        onAnimationEnd();
      }, 500);
    }, SECOND_MESSAGE_TIME);

    return () => {
      clearTimeout(firstMessageTimeout);
      clearTimeout(secondMessageTimeout);
    };
  }, [onAnimationEnd]);

  return (
    <AnimationWrapper $isSecondaryBackground={isSecondaryBackground}>
      <AnimatePresence>
        {animateFirstMessage && (
          <>
            <FeedbackIconContainer
              key="first-icon-container"
              variants={firstIconVariantTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              $isSecondaryBackground={isSecondaryBackground}
            >
              <firstMessage.icon />
            </FeedbackIconContainer>
            <TextContainer
              variants={firstTextVariantTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              key="first-text-container"
            >
              {firstMessage.text}
            </TextContainer>
          </>
        )}
        {animateSecondMessage && (
          <>
            <FeedbackIconContainer
              key="second-icon-container"
              variants={secondIconVariantTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              $isSecondaryBackground={isSecondaryBackground}
            >
              <secondMessage.icon />
            </FeedbackIconContainer>
            <TextContainer
              variants={secondTextVariantTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              key="second-text-container"
            >
              {secondMessage.text}
            </TextContainer>
          </>
        )}
      </AnimatePresence>
    </AnimationWrapper>
  );
};

const AnimationWrapper = styled(Stack)<{
  $isSecondaryBackground?: boolean;
}>`
  ${({ theme, $isSecondaryBackground }) => css`
    overflow: hidden;
    display: grid;
    grid-template-rows: 2fr 1fr;
    grid-template-columns: 1fr;
    grid-template-areas:
      'icon'
      'text';
    align-items: center;
    justify-content: center;
    background-color: ${$isSecondaryBackground ? theme.backgroundColor.secondary : theme.backgroundColor.primary};
  `}
`;

const FeedbackIconContainer = styled(motion(Stack))<{
  $isSecondaryBackground?: boolean;
}>`
  ${({ theme, $isSecondaryBackground }) => css`
    background-color: ${$isSecondaryBackground ? theme.backgroundColor.secondary : theme.backgroundColor.primary};
    padding: ${theme.spacing[7]} ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[3]};
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius.full};
    border: 4px solid
      ${$isSecondaryBackground ? theme.backgroundColor.secondary : theme.backgroundColor.primary};
  `}
`;

const TextContainer = styled(motion.div)`
  ${({ theme }) => css`
    ${createFontStyles('label-1')};
    padding-top: ${theme.spacing[3]};
    height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    text-align: center;
  `}
`;

export default GenericTransition;
