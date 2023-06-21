import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

const PaymentCardData = () => (
  <Container>
    <CenterImage>
      <Image
        src="/home/vault-pii/card-data/payment-card.png"
        alt="decorative"
        width={497}
        height={217}
      />
    </CenterImage>
    <LeftImage
      src="/home/vault-pii/card-data/bg-left.svg"
      alt="decorative"
      width={312}
      height={308}
    />
    <Image
      src="/home/vault-pii/card-data/bg-right.svg"
      alt="decorative"
      width={312}
      height={308}
    />
  </Container>
);

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const CenterImage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  ${media.greaterThan('sm')`
    height: 217px;
    width: 497px;
  `}
`;

const LeftImage = styled(Image)`
  ${({ theme }) => css`
    border-right: ${theme.borderWidth[1]} solid #20264f;
  `}
`;

export default PaymentCardData;
