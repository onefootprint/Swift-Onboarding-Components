import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const DesktopIllustration = () => (
  <Grid>
    <ImageContainer data-grid-area="hey-there">
      <Image src="/kyb/verify-businesses/hey-there.png" alt="Basic Data" width={336.8} height={265} />
      <Image src="/kyb/verify-businesses/basic-data.png" alt="Basic Data" width={336.8} height={358.75} />
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
    <ImageContainer data-grid-area="bos">
      <Image src="/kyb/verify-businesses/bos.png" alt="Residential Address" width={336.8} height={391} />
    </ImageContainer>
  </Grid>
);

const Grid = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      padding-right: ${theme.spacing[9]};
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr;
      gap: ${theme.spacing[5]};
      mask: linear-gradient(180deg, black 0%, black 60%, transparent 90%);
      mask-mode: alpha;
      height: 650px;
      overflow: hidden;
      align-items: flex-start;
      justify-content: flex-start;
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

export default DesktopIllustration;
