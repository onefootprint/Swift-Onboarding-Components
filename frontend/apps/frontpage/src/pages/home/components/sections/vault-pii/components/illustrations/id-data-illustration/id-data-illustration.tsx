import { primitives } from '@onefootprint/design-tokens';
import styled from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

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
        src="/home/vault-pii/id-data/basic-data.png"
        alt="decorative"
        width={408}
        height={180}
        priority
      />
      <CardBottomLeft
        src="/home/vault-pii/id-data/id-data.png"
        alt="decorative"
        width={408}
        height={180}
        priority
      />
      <CardRight
        src="/home/vault-pii/id-data/address.png"
        alt="decorative"
        width={408}
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
    ${primitives.Gray800} 0%,
    transparent 90%
  );
  mask-mode: alpha;

  ${media.greaterThan('md')`
        background: radial-gradient(
          circle,
          ${primitives.Gray800} 0%,
          transparent 100%
        );
        mask: radial-gradient(
        circle,
        ${primitives.Gray800} 0%,
        ${primitives.Gray800} 50%,
        transparent 100%
      );
    `}
`;

const CardGrid = styled.div`
  display: grid;
  gap: 14px;
  scale: 0.8;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 180px 180px;
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
