import { Box, Container, media } from '@onefootprint/ui';
import { useInView } from 'framer-motion';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import Phone from './components/phone';
import Words from './components/words/words';

const phrase = 'We also require a selfie 🤳 from your users, to make sure that they are who they say they are 🧑 🪪';
const WORD_ANIMATION_DELAY = 0.1;
const WORD_ANIMATION_DURATION = 1.2;

const SelfieSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-25%' });

  return (
    <>
      <StyledContainer position="relative" ref={containerRef} align="center" justify="center">
        <Words
          phrase={phrase}
          shouldAnimate={isInView}
          delay={WORD_ANIMATION_DELAY}
          duration={WORD_ANIMATION_DURATION}
        />
        <Box minHeight="500px">
          <Phone />
        </Box>
      </StyledContainer>
    </>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[9]} 0;
    gap: ${theme.spacing[10]};
    
    && {
      max-width: 1100px;
    }

    ${media.greaterThan('md')`
      gap: ${theme.spacing[12]};
      padding: ${theme.spacing[12]} 0;
    `}
  `}
`;

export default SelfieSection;
