import { primitives } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

const CustomDataIllustration = () => (
  <Container>
    <CenterImage>
      <Image
        src="/home/vault-pii/custom-data/custom-data-dark.png"
        alt="decorative"
        height={281}
        width={498}
      />
    </CenterImage>
    <ImageContainer>
      <BackgroundImageLeft
        src="/home/vault-pii/custom-data/background-stripes.png"
        height={308}
        width={312}
        alt="decorative"
      />
    </ImageContainer>
  </Container>
);

const Container = styled.div`
  isolation: isolate;
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    background-image: url('/home/vault-pii/custom-data/background-full.png');
    background-repeat: repeat;
    background-size: contain;
    background-position: center;
    opacity: 0.02;
  }
`;

const CenterImage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  width: 90%;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  ${media.greaterThan('sm')`
    transform: translate(-50%, 0%);
    width: 498px;
    height: 281px;
    top: 32px;
  `}
`;

const BackgroundImageLeft = styled(Image)`
  opacity: 0.03;
  z-index: 1;
  display: block;
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    border-right: ${theme.borderWidth[1]} solid ${primitives.Gray700};
    z-index: 1;
    width: 50%;
  `}
`;

export default CustomDataIllustration;
