import type { Variants } from 'framer-motion';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';

type BifrostImageProps = {
  src: string;
  height: number;
  width: number;
  variants?: Variants;
  zIndex?: number;
};

const BifrostImage = ({ src, height, width, zIndex = 1, variants }: BifrostImageProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-50%',
  });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('animate');
    }
  }, [controls, isInView]);

  return (
    <Container
      variants={variants}
      initial="initial"
      animate={controls}
      height={height}
      width={width}
      zIndex={zIndex}
      ref={ref}
    >
      <Image src={src} height={height} width={width} alt="decorative" />
    </Container>
  );
};

const Container = styled(motion.div)<{
  height: number;
  width: number;
  zIndex: number;
}>`
  ${({ height, width, zIndex, theme }) => css`
    z-index: ${zIndex};
    height: ${height}px;
    width: ${width}px;
    position: absolute;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `}
`;

export default BifrostImage;
