import { primitives } from '@onefootprint/design-tokens';
import styled from '@onefootprint/styled';
import { Grid, media } from '@onefootprint/ui';
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
    <CardGrid
      columns={['1fr 1fr']}
      rows={['180px 180px']}
      templateAreas={['top-left right', 'bottom-left right']}
    >
      <Grid.Item gridArea="top-left">
        <Image
          src="/home/vault-pii/id-data/basic-data.png"
          alt="decorative"
          width={408}
          height={180}
          priority
        />
      </Grid.Item>
      <Grid.Item gridArea="bottom-left">
        <Image
          src="/home/vault-pii/id-data/id-data.png"
          alt="decorative"
          width={408}
          height={180}
          priority
        />
      </Grid.Item>
      <Grid.Item gridArea="right">
        <Image
          src="/home/vault-pii/id-data/address.png"
          alt="decorative"
          width={408}
          height={376}
          priority
        />
      </Grid.Item>
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

const CardGrid = styled(Grid.Container)`
  gap: 14px;
  scale: 0.8;

  ${media.greaterThan('md')`
      position: absolute;
      scale: 1;
      top: 50%;
      transform: translateY(-50%);
  `}

  & > * {
    z-index: 1;
  }
`;

export default IdDataIllustration;
