import { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import { useTimeout } from 'usehooks-ts';

import FeedbackIcon from './components/feedback-icon';
import {
  checkIconVariants,
  firstIconContainerVariants,
  firstTextContainerVariants,
  secondIconContainerVariants,
  secondTextContainerVariants,
} from './transitions';

type GenericTransitionProps = {
  firstText: string;
  secondText: string;
  firstIcon: Icon;
  secondIcon: Icon;
  timeout: number;
  onAnimationEnd: () => void;
  isSecondaryBackground?: boolean;
  showFeedbackIcon?: boolean;
};

const GenericTransition = ({
  firstText,
  secondText,
  firstIcon: IconFirst,
  secondIcon: IconSecond,
  timeout,
  onAnimationEnd,
  isSecondaryBackground,
  showFeedbackIcon,
}: GenericTransitionProps) => {
  const renderedFirstIcon = <IconFirst />;
  const renderedSecondIcon = <IconSecond />;

  useTimeout(onAnimationEnd, timeout);

  return (
    <AnimationWrapper isSecondaryBackground={isSecondaryBackground}>
      <Icons>
        <IconContainer
          variants={firstIconContainerVariants}
          initial="initial"
          animate="animate"
        >
          {renderedFirstIcon}
        </IconContainer>
        {showFeedbackIcon && (
          <FeedbackIconContainer
            isSecondaryBackground={isSecondaryBackground}
            variants={checkIconVariants}
            initial="initial"
            animate="animate"
          >
            <FeedbackIcon variant="success" />
          </FeedbackIconContainer>
        )}
        <IconContainer
          variants={secondIconContainerVariants}
          initial="initial"
          animate="animate"
        >
          {renderedSecondIcon}
        </IconContainer>
      </Icons>
      <Text>
        <TextContainer
          variants={firstTextContainerVariants}
          initial="initial"
          animate="animate"
        >
          <Typography variant="label-2">{firstText}</Typography>
        </TextContainer>
        <TextContainer
          variants={secondTextContainerVariants}
          initial="initial"
          animate="animate"
        >
          <Typography variant="label-2">{secondText}</Typography>
        </TextContainer>
      </Text>
    </AnimationWrapper>
  );
};

const AnimationWrapper = styled(motion.div)<{
  isSecondaryBackground?: boolean;
}>`
  ${({ theme, isSecondaryBackground }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[6]};
    align-items: center;
    overflow: hidden;
    background-color: ${isSecondaryBackground
      ? theme.backgroundColor.secondary
      : theme.backgroundColor.primary};
  `}
`;

const FeedbackIconContainer = styled(motion.div)<{
  isSecondaryBackground?: boolean;
}>`
  ${({ theme, isSecondaryBackground }) => css`
    position: absolute;
    bottom: 2px;
    right: -6px;
    transform: translate(-50%, -50%);
    z-index: 1;
    background-color: ${isSecondaryBackground
      ? theme.backgroundColor.secondary
      : theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.full};
    border: 4px solid
      ${isSecondaryBackground
        ? theme.backgroundColor.secondary
        : theme.backgroundColor.primary};
  `}
`;

const Icons = styled.div`
  position: relative;
  isolation: isolate;
  width: 60px;
  height: 60px;
`;

const IconContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 0;

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const TextContainer = styled(motion.div)`
  height: fit-content;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const Text = styled.div`
  width: 100%;
  height: 24px;
  position: relative;
  text-align: center;
`;

export default GenericTransition;
