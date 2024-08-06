import { IcoBolt24, IcoUser24 } from '@onefootprint/icons';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import styled, { css } from 'styled-components';

import MobileDemoVideo from './components/mobile-demo-video';

const Illustration = () => {
  const ref = useRef(null);

  return (
    <Container ref={ref}>
      <MobileDemoVideo videoUrl="/video/onboarding.mp4" />
      <motion.span
        animate={{
          rotate: [0, 360],
          transition: {
            duration: 20,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          },
        }}
      >
        <Circle diameter={600}>
          <IconContainer
            data-type="bolt"
            animate={{
              rotate: [0, -360],
              transition: {
                duration: 20,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
              },
            }}
          >
            <IcoBolt24 />
          </IconContainer>
        </Circle>
      </motion.span>
      <motion.span
        animate={{
          rotate: [0, 360],
          transition: {
            duration: 25,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          },
        }}
      >
        <Circle diameter={480}>
          <IconContainer
            data-type="user"
            animate={{
              rotate: [0, -360],
              transition: {
                duration: 25,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
              },
            }}
          >
            <IcoUser24 />
          </IconContainer>
        </Circle>
      </motion.span>
      <Circle diameter={350} />
    </Container>
  );
};

const Container = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Circle = styled(motion.div)<{ diameter: number }>`
  ${({ diameter, theme }) => css`
    width: ${diameter}px;
    height: ${diameter}px;
    border-radius: 50%;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: absolute;
    top: calc(50% - ${diameter}px / 2);
    left: calc(50% - ${diameter}px / 2);
    z-index: 0;
  `}
`;

const IconContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    width: ${theme.spacing[8]};
    height: ${theme.spacing[8]};
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
    border-radius: 50%;
    border: 1.5px solid ${theme.borderColor.tertiary};

    &[data-type='bolt'] {
      top: 12%;
      left: 12%;
    }

    &[data-type='user'] {
      top: 50%;
      left: calc(100% - 16px);
    }
  `}
`;

export default Illustration;
