import { useInterval } from '@onefootprint/hooks';
import type React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import range from './components/range';
import Sparkle from './components/sparkle';

const SPARKLE_MIN_SIZE = 20;
const SPARKLE_MAX_SIZE = 40;
const SPARKLE_DURATION = 850;
const SPARKLE_INTERVAL = 350;

type SparklesProps = {
  color: string;
  children: React.ReactNode;
};

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

const generateSparkle = (color: string) => {
  const sparkle = {
    id: String(random(10000, 99999)),
    createdAt: Date.now(),
    color,
    size: random(SPARKLE_MIN_SIZE, SPARKLE_MAX_SIZE),
    style: {
      top: `${random(0, 100)}%`,
      left: `${random(0, 100)}%`,
    },
  };
  return sparkle;
};

const Sparkles = ({ color, children, ...delegated }: SparklesProps) => {
  const [sparkles, setSparkles] = useState(() => range(3, 3).map(() => generateSparkle(color)));

  useInterval(() => {
    const sparkle = generateSparkle(color);
    const now = Date.now();
    const nextSparkles = sparkles.filter(sp => {
      const delta = now - sp.createdAt;
      return delta < SPARKLE_DURATION;
    });
    nextSparkles.push(sparkle);
    setSparkles(nextSparkles);
  }, SPARKLE_INTERVAL);
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

const Container = styled.span`
  display: inline-block;
  position: relative;
`;

const ChildContainer = styled.strong`
  position: relative;
  z-index: 1;
  font-weight: bold;
`;

export default Sparkles;
