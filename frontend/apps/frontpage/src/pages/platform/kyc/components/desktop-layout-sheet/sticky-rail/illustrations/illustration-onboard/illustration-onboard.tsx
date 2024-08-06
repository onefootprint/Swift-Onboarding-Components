import { IcoBolt24, IcoUser24 } from '@onefootprint/icons';
import type { MotionValue } from 'framer-motion';
import { motion, useInView, useMotionValueEvent, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import MobileDemoVideo from 'src/components/mobile-demo-video';
import styled, { css } from 'styled-components';

type IllustrationOnboardProps = {
  scroll: MotionValue;
};

const VISIBLE_RANGE = {
  initial: 0,
  maxInitial: 0.1,
  maxFinal: 0.12,
  final: 0.14,
};

const IllustrationOnboard = ({ scroll }: IllustrationOnboardProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 'all' });

  const opacity = useTransform(scroll, [0, VISIBLE_RANGE.maxInitial, VISIBLE_RANGE.maxFinal], ['100%', '100%', '0%']);
  const scaleOutCircle = useTransform(scroll, [0, 1], [1, 3]);
  const scaleCenterCircle = useTransform(scroll, [0, 1], [1, 2]);
  const scaleInnerCircle = useTransform(scroll, [0, 1], [1, 1.5]);

  useMotionValueEvent(scroll, 'change', latest => {
    if (latest > VISIBLE_RANGE.maxFinal) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  return isVisible ? (
    <Container style={{ opacity }} ref={ref}>
      <MobileDemoVideo videoUrl="/kyc/sticky-rail/onboarding.mp4" shouldPlay={isInView} />
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
        <Circle $diameter={600} style={{ scale: scaleOutCircle }}>
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
        <Circle $diameter={480} style={{ scale: scaleCenterCircle }}>
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
      <Circle $diameter={350} style={{ scale: scaleInnerCircle }} />
    </Container>
  ) : null;
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

const Circle = styled(motion.div)<{ $diameter: number }>`
  ${({ $diameter, theme }) => css`
    width: ${$diameter}px;
    height: ${$diameter}px;
    border-radius: 50%;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: absolute;
    top: calc(50% - ${$diameter}px / 2);
    left: calc(50% - ${$diameter}px / 2);
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

export default IllustrationOnboard;
