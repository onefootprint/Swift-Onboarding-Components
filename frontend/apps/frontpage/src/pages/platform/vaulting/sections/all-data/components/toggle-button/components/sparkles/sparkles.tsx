import { useInterval } from '@onefootprint/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import styled from 'styled-components';

import range from './components/range';

type SparklesProps = {
  color: string;
  children: React.ReactNode;
};

type SparkleProps = {
  size: number;
  color: string;
  style: React.CSSProperties;
};

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

const generateSparkle = (color: string) => {
  const sparkle = {
    id: String(random(10000, 99999)),
    createdAt: Date.now(),
    color,
    size: random(20, 40),
    style: {
      top: `${random(0, 100)}%`,
      left: `${random(0, 100)}%`,
    },
  };
  return sparkle;
};

const sparkAnimation = {
  initial: {
    scale: 0,
    opacity: 0,
    rotate: 0,
    y: -10,
  },
  animate: {
    scale: 1,
    opacity: [1, 0],
    rotate: 180,
    y: -30,
    transition: {
      duration: 2,
      ease: 'easeOut',
    },
  },
  exit: {
    rotate: 0,
    scale: 0.5,
    opacity: 0,
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  },
};

const Sparkles = ({ color, children, ...delegated }: SparklesProps) => {
  const [sparkles, setSparkles] = useState(() => range(3, 3).map(() => generateSparkle(color)));

  useInterval(() => {
    const sparkle = generateSparkle(color);
    const now = Date.now();
    const nextSparkles = sparkles.filter(sp => {
      const delta = now - sp.createdAt;
      return delta < 750;
    });
    nextSparkles.push(sparkle);
    setSparkles(nextSparkles);
  }, 500);
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Container {...delegated}>
      {sparkles.map(sparkle => (
        <Sparkle key={sparkle.id} color={sparkle.color} size={sparkle.size} style={sparkle.style} />
      ))}
      <ChildContainer>{children}</ChildContainer>
    </Container>
  );
};

const Sparkle = ({ size, color, style }: SparkleProps) => {
  const path =
    'M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z';
  return (
    <AnimatePresence>
      <SparkleContainer style={style} initial="initial" variants={sparkAnimation} animate="animate" exit="exit">
        <SparkleSvg width={size} height={size} viewBox="0 0 68 68" fill="none">
          <path d={path} fill={color} />
        </SparkleSvg>
      </SparkleContainer>
    </AnimatePresence>
  );
};

const Container = styled.span`
  width: 100%;
  display: inline-block;
  position: relative;
`;

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

const ChildContainer = styled.strong`
  position: relative;
  z-index: 1;
  font-weight: bold;
`;

export default Sparkles;
