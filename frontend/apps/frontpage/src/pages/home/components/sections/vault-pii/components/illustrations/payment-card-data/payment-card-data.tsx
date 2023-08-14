import { primitives } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

const PaymentCardData = () => (
  <Container>
    <CenterImage>
      <Image
        src="/home/vault-pii/card-data/payment-card-data.png"
        alt="decorative"
        width={497}
        height={217}
      />
    </CenterImage>
    <ImageContainer>
      <LeftImage
        src="/home/vault-pii/card-data/background-left-dark.png"
        alt="decorative"
        width={312}
        height={308}
      />
    </ImageContainer>
  </Container>
);

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/home/vault-pii/card-data/background-surface.png');
    background-repeat: repeat;
    background-size: contain;
    background-position: center;
    opacity: 0.03;
    z-index: 1;
  }
`;

const CenterImage = styled.div`
  position: absolute;
  z-index: 2;
  bottom: 16px;
  left: 50%;
  transform: translate(-50%, 0%);
  width: 90%;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  ${media.greaterThan('sm')`
    height: 251px;
    width: 497px;
  `}
`;

const LeftImage = styled(Image)`
  opacity: 0.02;
  object-fit: cover;
  z-index: 1;
  right: 0;
  top: 0;
  position: absolute;
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    width: 50%;
    height: 100%;
    top: 0;
    left: 0;
    border-right: ${theme.borderWidth[1]} solid ${primitives.Gray700};
    z-index: 1;
  `}
`;

export default PaymentCardData;
