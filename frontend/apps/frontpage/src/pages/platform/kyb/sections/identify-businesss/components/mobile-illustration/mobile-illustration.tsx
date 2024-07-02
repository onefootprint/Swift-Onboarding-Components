import { Grid, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const MobileIllustration = () => (
  <Container>
    <Grid.Container
      columns={['1fr']}
      rows={['auto']}
      templateAreas={['hey-there', 'basic-data', 'bos', 'business-address']}
      gap={5}
      maxWidth="100%"
    >
      <ImageContainer gridArea="hey-there">
        <Image src="/kyb/verify-businesses/hey-there.png" alt="Basic Data" width={336.8} height={265} />
      </ImageContainer>
      <ImageContainer gridArea="basic-data">
        <Image src="/kyb/verify-businesses/basic-data.png" alt="Basic Data" width={336.8} height={358.75} />
      </ImageContainer>
      <ImageContainer gridArea="bos">
        <Image src="/kyb/verify-businesses/bos.png" alt="Residential Address" width={336.8} height={391} />
      </ImageContainer>
      <ImageContainer gridArea="business-address">
        <Image src="/kyb/verify-businesses/business-address.png" alt="App Clip" width={336.8} height={497.7} />
      </ImageContainer>
    </Grid.Container>
  </Container>
);

const Container = styled.div`
  position: relative;
  height: 520px;
  overflow: hidden;
  mask: linear-gradient(
    180deg,
    transparent 0%,
    black 10%,
    black 50%,
    black 90%,
    transparent 100%
  );
  mask-mode: alpha;

  ${media.greaterThan('md')`
    display: none;
  `}
`;

const ImageContainer = styled(Grid.Item)`
  img {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }
`;

export default MobileIllustration;
