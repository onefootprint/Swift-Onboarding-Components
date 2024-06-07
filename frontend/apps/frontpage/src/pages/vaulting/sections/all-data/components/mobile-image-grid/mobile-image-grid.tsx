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
      <ImageContainer
        gridArea="basic-data"
        key={isDecrypted ? 'decrypted' : 'encrypted'}
        variants={imageVariants}
        initial="initial"
        animate="animate"
      >
        <Image
          src={`/vaulting/all-data/${isDecrypted ? 'decrypted' : 'encrypted'}/basic-data.png`}
          width={632}
          height={211}
          alt=""
          priority
        />
      </ImageContainer>
      <ImageContainer
        gridArea="id-data"
        key={isDecrypted ? 'decrypted' : 'encrypted'}
        variants={imageVariants}
        initial="initial"
        animate="animate"
      >
        <Image
          src={`/vaulting/all-data/${isDecrypted ? 'decrypted' : 'encrypted'}/id-data.png`}
          width={632}
          height={211}
          alt=""
          priority
        />
      </ImageContainer>
      <ImageContainer
        gridArea="address"
        key={isDecrypted ? 'decrypted' : 'encrypted'}
        variants={imageVariants}
        initial="initial"
        animate="animate"
      >
        <Image
          src={`/vaulting/all-data/${isDecrypted ? 'decrypted' : 'encrypted'}/address.png`}
          width={632}
          height={306}
          alt=""
          priority
        />
      </ImageContainer>
      <ImageContainer
        gridArea="payment-data"
        key={isDecrypted ? 'decrypted' : 'encrypted'}
        variants={imageVariants}
        initial="initial"
        animate="animate"
      >
        <Image
          src={`/vaulting/all-data/${isDecrypted ? 'decrypted' : 'encrypted'}/payment-data.png`}
          width={632}
          height={306}
          alt=""
          priority
        />
      </ImageContainer>
      <ImageContainer
        gridArea="custom-data"
        key={isDecrypted ? 'decrypted' : 'encrypted'}
        variants={imageVariants}
        initial="initial"
        animate="animate"
      >
        <Image
          src={`/vaulting/all-data/${isDecrypted ? 'decrypted' : 'encrypted'}/custom-data.png`}
          width={1280}
          height={170}
          alt=""
          priority
        />
      </ImageContainer>
    </ImagesGrid>
  </Container>
);

const ImagesGrid = styled(Grid.Container)`
  transform: translateX(-50%);
  left: 50%;
`;

const ImageContainer = styled(motion.div)<{ gridArea: string }>`
  ${({ gridArea }) => css`
    grid-area: ${gridArea};

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
