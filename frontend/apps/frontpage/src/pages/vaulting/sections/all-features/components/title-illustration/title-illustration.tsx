import React from 'react';
import styled, { css } from 'styled-components';

import IllustrationContainer from '../../../../components/illustration-section-title/container';
import Rectangle from '../../../../components/illustration-section-title/rectangle/rectangle';

const TitleIllustration = () => (
  <Container>
    <BackCard>
      <IllustrationContainer removeMask>
        <Rectangle top={32} left={32} width={80} height={12} />
        <Rectangle top={26} left={124} width={24} height={24} />
        <Rectangle top={32} left={164} width={160} height={12} />
        <Rectangle top={56} left={134} width={4} height={24} />
        <Rectangle top={92} left={32} width={80} height={12} />
        <Rectangle top={86} left={124} width={24} height={24} />
        <Rectangle top={92} left={164} width={160} height={12} />
      </IllustrationContainer>
    </BackCard>
    <FrontCard>
      <IllustrationContainer removeMask>
        <Rectangle top={32} left={140} width={80} height={12} />
        <Rectangle top={72} left={40} width={280} height={20} />
        <Rectangle top={122} left={40} width={180} height={16} />
      </IllustrationContainer>
    </FrontCard>
  </Container>
);

const Container = styled.div`
  position: relative;
  overflow: hidden;
  height: 220px;
  width: 444px;
  mask: radial-gradient(
    100% 100% at 50% 0%,
    black 0%,
    black 50%,
    transparent 100%
  );
  mask-mode: alpha;
`;

const FrontCard = styled.div`
  ${({ theme }) => css`
    z-index: 1;
    position: absolute;
    box-shadow: ${theme.elevation[3]};
    right: 0;
    bottom: 24px;

    &::after {
      content: '';
      position: absolute;
      bottom: -24px;
      left: 0;
      width: 100%;
      height: 24px;
      background: ${theme.backgroundColor.primary};
      z-index: 2;
    }
  `}
`;

const BackCard = styled.div`
  position: absolute;
  top: 80px;
  left: 0;
`;

export default TitleIllustration;
