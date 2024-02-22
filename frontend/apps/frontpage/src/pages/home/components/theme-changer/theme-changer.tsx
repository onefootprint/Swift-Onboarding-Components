import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'framer-motion';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type ThemeChangerProps = {
  children: React.ReactNode;
};

const ThemeChanger = ({ children }: ThemeChangerProps) => {
  const scrollInRef = useRef(null);
  const scrollOutRef = useRef(null);
  const { setTheme } = useTheme();
  const [scrollingIn, setScrollingIn] = useState(0);
  const [scrollingOut, setScrollingOut] = useState(0);

  const { scrollYProgress: scrollInProgress } = useScroll({
    target: scrollInRef,
  });
  const opacityIn = useSpring(scrollInProgress);
  useMotionValueEvent(scrollInProgress, 'change', latest => {
    setScrollingIn(latest);
  });

  const { scrollYProgress: scrollOutProgress } = useScroll({
    target: scrollOutRef,
  });
  const opacityOut = useSpring(scrollOutProgress);
  useMotionValueEvent(scrollOutProgress, 'change', latest => {
    setScrollingOut(latest);
  });

  useEffect(() => {
    if (scrollingIn < 0.5 && scrollingOut > 0.5) {
      setTheme('dark');
    } else if (scrollingOut < 0.5) {
      setTheme('light');
    } else {
      setTheme('light');
    }
  }, [scrollingIn, scrollingOut, setTheme]);

  return (
    <Container>
      <ProgressIn style={{ opacity: opacityIn }}>
        <div ref={scrollInRef} />
      </ProgressIn>
      {children}
      <ProgressOut style={{ opacity: opacityOut }}>
        <div ref={scrollOutRef} />
      </ProgressOut>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  z-index: 0;
`;

const ProgressIn = styled(motion.div)`
  position: relative;
  z-index: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 200vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  background: radial-gradient(
    100% 65% at 50% 100%,
    #161616 0%,
    #161616 40%,
    transparent 100%
  );
`;

const ProgressOut = styled(motion.div)`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 200vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  background: radial-gradient(
    100% 100% at 50% 0%,
    #161616 0%,
    #161616 40%,
    transparent 100%
  );
`;

export default ThemeChanger;
