import { Container, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
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

const images = [
  { gridArea: 'basic-data', width: 632, height: 211, name: 'basic-data' },
  { gridArea: 'id-data', width: 632, height: 211, name: 'id-data' },
  { gridArea: 'address', width: 632, height: 306, name: 'address' },
  { gridArea: 'payment-data', width: 632, height: 306, name: 'payment-data' },
  { gridArea: 'custom-data', width: 1280, height: 170, name: 'custom-data' },
];

const DesktopImageGrid = ({ isDecrypted }: DesktopImageGridProps) => (
  <Grid>
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

const ImageContainer = styled(motion.div)<{ $gridArea: string }>`
  ${({ $gridArea }) => css`
    grid-area: ${$gridArea};
  `}
`;

export default DesktopImageGrid;
