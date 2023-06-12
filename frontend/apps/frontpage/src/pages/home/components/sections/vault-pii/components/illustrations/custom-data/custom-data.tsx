import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const CustomDataIllustration = () => (
  <Container>
    <CenterImage>
      <Image
        src="/home/vault-pii/custom-data/custom-data.png"
        alt="decorative"
        height={281}
        width={498}
      />
    </CenterImage>
    <BackgroundImage
      src="/home/vault-pii/custom-data/bg-left.svg"
      height={308}
      width={312}
      alt="decorative"
    />
  </Container>
);

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
`;

const CenterImage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
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

const BackgroundImage = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    border-right: ${theme.borderWidth[1]} solid #20264f;
  `}
`;

export default CustomDataIllustration;
