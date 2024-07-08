import { useScroll } from 'framer-motion';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';

import IllustrationAppClip from './illustrations/illustration-app-clip';
import IllustrationConfidence from './illustrations/illustration-confidence';
import IllustrationOnboard from './illustrations/illustration-onboard';
import IllustrationOnboardingExperience from './illustrations/illustration-onboarding-experience';

const StickyRail = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
  });

  return (
    <Container ref={ref}>
      <StickyFrame $containerHeight={800}>
        <IllustrationOnboard scroll={scrollYProgress} />
        <IllustrationConfidence scroll={scrollYProgress} />
        <IllustrationOnboardingExperience scroll={scrollYProgress} />
        <IllustrationAppClip scroll={scrollYProgress} />
      </StickyFrame>
    </Container>
  );
};

const Container = styled.div`
  grid-area: stickyRail;
  width: 100%;
  height: 100%;
  position: relative;
`;

const StickyFrame = styled.div<{ $containerHeight: number }>`
  ${({ $containerHeight }) => css`
    top: calc(50% - ${$containerHeight / 2}px);
    width: 100%;
    height: ${$containerHeight}px;
    position: sticky;
    isolation: isolate;
  `};
`;

export default StickyRail;
