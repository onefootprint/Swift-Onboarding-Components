import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const IdDataIllustration = () => (
  <>
    <BackgroundDots
      src="/home/vault-pii/id-data/dots.svg"
      alt="decorative"
      height={480}
      width={640}
    />
    <CardGrid>
      <CardTopLeft
        src="/home/vault-pii/id-data/card1.png"
        alt="decorative"
        width={475}
        height={196}
        priority
      />
      <CardBottomLeft
        src="/home/vault-pii/id-data/card2.png"
        alt="decorative"
        width={475}
        height={166}
        priority
      />
      <CardRight
        src="/home/vault-pii/id-data/card3.png"
        alt="decorative"
        width={475}
        height={376}
        priority
      />
    </CardGrid>
  </>
);

const BackgroundDots = styled(Image)`
  position: absolute;
  z-index: 0;
  mask: radial-gradient(
    circle at 50% 30%,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0) 90%
  );
  mask-mode: alpha;

  ${media.greaterThan('md')`
    background: radial-gradient(
      circle,
      rgba(75, 38, 218, 0.3) 0%,
      rgba(75, 38, 218, 0) 100%
    );
    mask: radial-gradient(
    circle,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  `}
`;

const CardGrid = styled.div`
  display: grid;
  gap: 14px;
  scale: 0.8;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 196px 166px;
  grid-template-areas:
    'top-left right'
    'bottom-left right';

  ${media.greaterThan('md')`
      position: absolute;
      scale: 1;
      top: 50%;
      transform: translateY(-50%);
  `}
`;

const CardTopLeft = styled(Image)`
  grid-area: top-left;
  z-index: 1;
`;

const CardBottomLeft = styled(Image)`
  grid-area: bottom-left;
  z-index: 1;
`;

const CardRight = styled(Image)`
  grid-area: right;
  z-index: 1;
`;

export default IdDataIllustration;
