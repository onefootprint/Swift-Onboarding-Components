import { Grid, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type MobileImageGridProps = {
  isDecrypted: boolean;
};

const imageVariants = {
  initial: {
    opacity: 0.8,
    transition: {
      duration: 1,
    },
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
    },
  },
};

const images = [
  { gridArea: 'basic-data', width: 632, height: 211, name: 'basic-data' },
  { gridArea: 'id-data', width: 632, height: 211, name: 'id-data' },
  { gridArea: 'address', width: 632, height: 306, name: 'address' },
  { gridArea: 'payment-data', width: 632, height: 306, name: 'payment-data' },
  { gridArea: 'custom-data', width: 1280, height: 170, name: 'custom-data' },
];

const MobileImageGrid = ({ isDecrypted }: MobileImageGridProps) => (
  <Container>
    <ImagesGrid
      position="absolute"
      top={0}
      gap={5}
      rows={['auto']}
      columns={['340px']}
      templateAreas={['basic-data', 'id-data', 'address', 'payment-data', 'custom-data']}
    >
      {images.map(image => (
        <ImageContainer
          key={image.name}
          $gridArea={image.gridArea}
          variants={imageVariants}
          initial="initial"
          animate="animate"
        >
          <Image
            src={`/vaulting/all-data/${isDecrypted ? 'decrypted' : 'encrypted'}/${image.name}.png`}
            width={image.width}
            height={image.height}
            alt=""
            priority
          />
        </ImageContainer>
      ))}
    </ImagesGrid>
  </Container>
);

const ImagesGrid = styled(Grid.Container)`
  transform: translateX(-50%);
  left: 50%;
`;

const ImageContainer = styled(motion.div)<{ $gridArea: string }>`
  ${({ $gridArea }) => css`
    grid-area: ${$gridArea};

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  `}
`;

const Container = styled.div`
  width: 100%;
  position: relative;
  height: 600px;
  mask: radial-gradient(
    100% 100% at 50% 0%,
    black 0%,
    black 80%,
    transparent 100%
  );
  mask-mode: alpha;

  ${media.greaterThan('md')`
    display: none;
  `}
`;

export default MobileImageGrid;
