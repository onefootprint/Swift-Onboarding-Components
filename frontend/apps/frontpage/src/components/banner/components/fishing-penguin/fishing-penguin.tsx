import { Box, media } from '@onefootprint/ui';
import Image from 'next/image';
import styled from 'styled-components';

export const FishingPenguin = () => (
  <IllustrationContainer>
    <Penguin
      src="/banners/fishing-penguin/fishing-penguin.svg"
      alt="Fishing Penguin"
      width={275}
      height={275}
      loading="lazy"
    />
    <Bucket src="/banners/fishing-penguin/bucket.svg" alt="Fishing Bucket" width={100} height={100} loading="lazy" />
  </IllustrationContainer>
);

const IllustrationContainer = styled(Box)`
  position: relative;
  transform: scale(0.8);

  ${media.greaterThan('md')`
    transform: scale(1);
  `}
`;

const Penguin = styled(Image)``;

const Bucket = styled(Image)`
  position: absolute;
  bottom: 0;
  right: 0%;
  height: auto;
  width: 80px;

  ${media.greaterThan('md')`
    transform: translateX(100%);
  `}
`;

export default FishingPenguin;
