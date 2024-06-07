import { Container, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type DesktopImageGridProps = {
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

const DesktopImageGrid = ({ isDecrypted }: DesktopImageGridProps) => (
  <Grid>
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
  </Grid>
);

const Grid = styled(Container)`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: grid;
      gap: ${theme.spacing[5]};
      grid-template-rows: auto;
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        'basic-data id-data'
        'address payment-data'
        'custom-data custom-data';
    `}
  `}
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

export default DesktopImageGrid;
