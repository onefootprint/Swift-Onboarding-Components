import { media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import times from 'lodash/times';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import LineDraw from '../../line';

type StripedBackgroundType = {
  color: string;
};

const layoutAnimationVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { type: 'spring', delay: 0.2 },
  },
};

const DESKTOP_LINE_COUNT = 360;
const MOBILE_LINE_COUNT = 80;

const StripedBackground = ({ color }: StripedBackgroundType) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <Container
      ref={ref}
      as={motion.div}
      animate={controls}
      initial="hidden"
      variants={layoutAnimationVariants}
      data-background={color}
    >
      <LineDraw height={100} width={0.2} color={color} position="relative" />
      <CenterWrap data-type="desktop">
        {times(DESKTOP_LINE_COUNT).map(value => (
          <LineDraw
            height={100}
            width={0.2}
            color={color}
            key={value}
            position="relative"
          />
        ))}
      </CenterWrap>
      <CenterWrap data-type="mobile">
        {times(MOBILE_LINE_COUNT).map(value => (
          <LineDraw
            height={100}
            width={0.3}
            color={color}
            key={value}
            position="relative"
          />
        ))}
      </CenterWrap>
      <LineDraw height={100} width={0.2} color={color} position="relative" />
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  transform: translate(0%, 50%);
  top: 15%;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  z-index: -1;
  transition: 2s;
  opacity: 0;
  will-change: opacity;
`;

const CenterWrap = styled.div`
  opacity: 0.13;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;

  &[data-type='desktop'] {
    display: none;
  }

  &[data-type='mobile'] {
    display: flex;
  }

  ${media.greaterThan('lg')`
    &[data-type='desktop'] {
      display: flex;
    }

    &[data-type='mobile'] {
      display: none;
    }
  `}
`;

export default StripedBackground;
