import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

const DesktopHeroImage = () => (
  <ImageContainer>
    <Image
      src="/vaulting/hero/dashboard-dark.png"
      alt="Vaulting Dashboard"
      width={988}
      height={733}
    />
  </ImageContainer>
);

const ImageContainer = styled.div`
  ${({ theme }) => css`
    display: block;
    position: relative;
    width: 100%;
    height: 430px;
    margin: auto;
    mask-mode: alpha;
    mask: radial-gradient(
      100% 100% at 50% 0%,
      black 0%,
      black 50%,
      transparent 100%
    );

    img {
      position: absolute;
      top: ${theme.spacing[4]};
      left: ${theme.spacing[4]};
    }

    ${media.greaterThan('md')`
        display: none;
    `}
  `}
`;

export default DesktopHeroImage;
