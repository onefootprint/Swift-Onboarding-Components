import { createFontStyles, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import type React from 'react';
import { memo } from 'react';
import styled, { css } from 'styled-components';

const WordVariants = {
  initial: { filter: 'blur(10px)', opacity: 0 },
  animate: {
    filter: 'blur(0px)',
    opacity: 1,
    transitionEnd: {
      filter: 'blur(0px)',
      opacity: 1,
    },
  },
};

type WordProps = {
  index: number;
  shouldAnimate: boolean;
  delay: number;
  duration: number;
  children: React.ReactNode;
};

const MemoizedWord = memo(({ index, shouldAnimate, delay, duration, children }: WordProps) => {
  return (
    <StyledMemoizedWord
      variants={WordVariants}
      initial="initial"
      animate={shouldAnimate ? 'animate' : 'initial'}
      transition={{
        delay: index * delay,
        filter: { duration },
        opacity: { duration },
      }}
    >
      {children}
    </StyledMemoizedWord>
  );
});

const StyledMemoizedWord = styled(motion.div)`
  ${({ theme }) => css`
    ${createFontStyles('display-2')}
    display: flex;
    margin-right: ${theme.spacing[4]};
    color: ${theme.color.primary};
    display: inline-block;
    width: fit-content;

    ${media.greaterThan('md')`
      ${createFontStyles('display-1')}
      margin-right: ${theme.spacing[5]};
    `}
  `}
`;

export default MemoizedWord;
