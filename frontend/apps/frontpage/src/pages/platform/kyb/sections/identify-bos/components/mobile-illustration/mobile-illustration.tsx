import { media } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

const GAP = 56;

const MobileIllustration = () => (
  <Grid>
    <ImageContainer layer={0}>
      <Image src="/kyb/verify-people/basic-data.png" alt="Basic Data" width={320} height={650} />
    </ImageContainer>
    <ImageContainer layer={1}>
      <Image src="/kyb/verify-people/residential-address.png" alt="Residential Address" width={320} height={650} />
    </ImageContainer>
    <ImageContainer layer={2}>
      <Image src="/kyb/verify-people/app-clip.png" alt="App Clip" width={320} height={650} />
    </ImageContainer>
  </Grid>
);

const Grid = styled.div`
  position: relative;
  height: 320px;
  mask-image: linear-gradient(180deg, black 0%, black 80%, transparent 100%);
  mask-mode: alpha;

  ${media.greaterThan('md')`
      display: none;
    `}
`;

const ImageContainer = styled.div<{ layer: number }>`
  ${({ theme, layer }) => css`
    height: auto;
    width: 56%;
    position: absolute;
    top: ${layer * GAP}px;
    left: ${layer * GAP}px;
    z-index: ${layer};

    img {
      height: 100%;
      width: 100%;
      object-fit: contain;
      position: relative;

      &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        box-shadow: ${theme.elevation[2]};
      }
    }
  `}
`;

export default MobileIllustration;
