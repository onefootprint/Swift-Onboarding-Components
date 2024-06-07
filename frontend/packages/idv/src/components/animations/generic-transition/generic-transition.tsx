import type { Icon } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
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
  firstText: string;
  secondText: string;
  firstIcon: Icon;
  secondIcon: Icon;
  timeout: number;
  onAnimationEnd: () => void;
  isSecondaryBackground?: boolean;
};

const FIRST_ICON_DELAY = 2000;
const SECOND_ICON_DELAY = 3500;

const GenericTransition = ({
  firstText,
  secondText,
  firstIcon: IconFirst,
  secondIcon: IconSecond,
  timeout,
  onAnimationEnd,
  isSecondaryBackground,
}: GenericTransitionProps) => {
  useTimeout(onAnimationEnd, timeout);

  const [renderFirstIcon, setRenderFirstIcon] = useState(true);
  const [renderSecondIcon, setRenderSecondIcon] = useState(false);

  useEffect(() => {
    const firstIconTimeout = setTimeout(() => {
      setRenderFirstIcon(false);
      setRenderSecondIcon(true);
    }, FIRST_ICON_DELAY);

    const secondIconTimeout = setTimeout(() => {
      setRenderSecondIcon(false);
      onAnimationEnd();
    }, FIRST_ICON_DELAY + SECOND_ICON_DELAY);

    return () => {
      clearTimeout(firstIconTimeout);
      clearTimeout(secondIconTimeout);
    };
  }, [onAnimationEnd]);

  return (
    <AnimationWrapper
      gap={3}
      direction="column"
      align="center"
      justify="center"
      isSecondaryBackground={isSecondaryBackground}
      height="100%"
    >
      <Stack height="60px" width="60px" display="column">
        <AnimatePresence>
          {renderFirstIcon ? (
            <FeedbackIconContainer
              key="first-icon-container"
              variants={firstIconVariantTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              isSecondaryBackground={isSecondaryBackground}
            >
              <IconFirst />
            </FeedbackIconContainer>
          ) : null}
          {renderSecondIcon ? (
            <FeedbackIconContainer
              key="second-icon-container"
              variants={secondIconVariantTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              isSecondaryBackground={isSecondaryBackground}
            >
              <IconSecond />
            </FeedbackIconContainer>
          ) : null}
        </AnimatePresence>
      </Stack>
      <Stack minHeight="60px" width="100%" textAlign="center" direction="column">
        {renderFirstIcon ? (
          <MotionStack variants={firstTextVariantTransition}>
            <Text variant="label-1">{firstText}</Text>
          </MotionStack>
        ) : null}
        {renderSecondIcon ? (
          <MotionStack variants={secondTextVariantTransition}>
            <Text variant="label-1">{secondText}</Text>
          </MotionStack>
        ) : null}
      </Stack>
    </AnimationWrapper>
  );
};

const AnimationWrapper = styled(Stack)<{
  isSecondaryBackground?: boolean;
}>`
  ${({ theme, isSecondaryBackground }) => css`
    overflow: hidden;
    padding: ${theme.spacing[11]} ${theme.spacing[3]} ${theme.spacing[3]}
      ${theme.spacing[3]};
    background-color: ${isSecondaryBackground ? theme.backgroundColor.secondary : theme.backgroundColor.primary};
  `}
`;

const MotionStack = styled(motion(Stack))`
  display: flex;
`;

const FeedbackIconContainer = styled(motion.div)<{
  isSecondaryBackground?: boolean;
}>`
  ${({ theme, isSecondaryBackground }) => css`
    background-color: ${isSecondaryBackground ? theme.backgroundColor.secondary : theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.full};
    border: 4px solid
      ${isSecondaryBackground ? theme.backgroundColor.secondary : theme.backgroundColor.primary};
  `}
`;

export default GenericTransition;
