import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import styled from 'styled-components';

type SparkleProps = {
  size: number;
  color: string;
  style: React.CSSProperties;
};

const Sparkle = ({ size, color, style }: SparkleProps) => {
  const path =
    'M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z';
  return (
    <AnimatePresence>
      <SparkleContainer
        style={style}
        initial={{
          scale: 0,
          opacity: 0,
          rotate: 0,
          y: -10,
        }}
        animate={{
          scale: 1,
          opacity: [1, 0],
          rotate: 180,
          y: -30,
          transition: {
            duration: 2,
            ease: 'easeOut',
          },
        }}
        exit={{
          rotate: 0,
          scale: 0,
          opacity: 0,
        }}
      >
        <SparkleSvg width={size} height={size} viewBox="0 0 68 68" fill="none">
          <path d={path} fill={color} />
        </SparkleSvg>
      </SparkleContainer>
    </AnimatePresence>
  );
};

const SparkleContainer = styled(motion.span)`
  position: absolute;
  display: block;
  z-index: 2;
  top: -50%;
  left: -50%;
`;

const SparkleSvg = styled.svg`
  display: block;
  pointer-events: none;
`;

export default Sparkle;
