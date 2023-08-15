import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

const MobileIllustration = () => (
  <Container>
    <Grid>
      <ImageContainer data-grid-area="hey-there">
        <Image
          src="/kyb/verify-businesses/hey-there.png"
          alt="Basic Data"
          width={336.8}
          height={265}
        />
      </ImageContainer>
      <ImageContainer data-grid-area="basic-data">
        <Image
          src="/kyb/verify-businesses/basic-data.png"
          alt="Basic Data"
          width={336.8}
          height={358.75}
        />
      </ImageContainer>
      <ImageContainer data-grid-area="bos">
        <Image
          src="/kyb/verify-businesses/bos.png"
          alt="Residential Address"
          width={336.8}
          height={391}
        />
      </ImageContainer>
      <ImageContainer data-grid-area="business-address">
        <Image
          src="/kyb/verify-businesses/business-address.png"
          alt="App Clip"
          width={336.8}
          height={497.7}
          data-grid-area="business-address"
        />
      </ImageContainer>
    </Grid>
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

const Grid = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 0%;
    height: 100%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    align-items: flex-start;
    justify-content: flex-start;

    ${media.greaterThan('md')`
      display: none;
    `}
  `}
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};

    img {
      object-fit: contain;
      width: 100%;
      height: 100%;
    }
  `}
`;

export default MobileIllustration;
