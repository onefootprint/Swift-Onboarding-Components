import { IcoCheck16, Icon } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type GenericTransitionProps = {
  firstText: string;
  secondText: string;
  firstIcon: Icon;
  secondIcon: Icon;
};

const FIRST_STEP_DURATION = 3;
const TRANSITION_DURATION = 0.2;

const GenericTransition = ({
  firstText,
  secondText,
  firstIcon: IconFirst,
  secondIcon: IconSecond,
}: GenericTransitionProps) => {
  const renderedFirstIcon = <IconFirst />;
  const renderedSecondIcon = <IconSecond />;

  return (
    <AnimationWrapper>
      <Icons>
        <FirstIconContainer
          initial={{
            opacity: 1,
            y: '50%',
            x: '50%',
          }}
          animate={{
            opacity: 0,
            y: 0,
            x: '50%',
            display: 'none',
            transition: {
              delay: FIRST_STEP_DURATION,
              duration: TRANSITION_DURATION,
              ease: 'easeInOut',
            },
          }}
        >
          <CheckContainer
            initial={{
              opacity: 0,
              scale: 1,
              x: 10,
              y: -10,
            }}
            animate={{
              opacity: 1,
              scale: [1.2, 1],
              x: 10,
              y: -10,
              transition: {
                delay: 1,
                duration: TRANSITION_DURATION,
                ease: 'easeInOut',
              },
            }}
          >
            <IcoCheck16 color="quinary" />
          </CheckContainer>
          {renderedFirstIcon}
        </FirstIconContainer>
        <SecondIconContainer
          initial={{
            opacity: 0,
            y: 0,
            x: '50%',
          }}
          animate={{
            opacity: 1,
            y: '50%',
            x: '50%',
            transition: {
              delay: FIRST_STEP_DURATION,
              duration: TRANSITION_DURATION,
              ease: 'easeInOut',
            },
          }}
        >
          {renderedSecondIcon}
        </SecondIconContainer>
      </Icons>
      <Text>
        <FirstTextContainer
          initial={{
            opacity: 1,
            y: 0,
          }}
          animate={{
            opacity: 0,
            y: -10,
            transition: {
              delay: FIRST_STEP_DURATION,
              duration: TRANSITION_DURATION,
              ease: 'easeInOut',
            },
          }}
        >
          <Typography variant="label-2">{firstText}</Typography>
        </FirstTextContainer>
        <SecondTextContainer
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              delay: FIRST_STEP_DURATION,
              duration: 0.2,
            },
          }}
        >
          <Typography variant="label-2">{secondText}</Typography>
        </SecondTextContainer>
      </Text>
    </AnimationWrapper>
  );
};

const AnimationWrapper = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[6]};
    align-items: center;
    overflow: hidden;
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const Icons = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
`;

const FirstIconContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
    position: absolute;
    transform: translate(50%, 50%);
    top: 0;
    left: 0;
  `}
`;

const SecondIconContainer = styled(motion.div)`
  height: fit-content;
  position: absolute;
  transform: translate(50%, 50%);
  top: 0;
  left: 0;
`;

const Text = styled.div`
  width: 100%;
  height: 24px;
  position: relative;
  display: absolute;
  text-align: center;
`;

const FirstTextContainer = styled(motion.div)`
  height: fit-content;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const SecondTextContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const CheckContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translate(50%, -50%);
    top: 0;
    right: 0;
    background-color: ${theme.color.success};
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[2]} solid ${theme.backgroundColor.primary};
    width: 24px;
    height: 24px;
  `}
`;

export default GenericTransition;
