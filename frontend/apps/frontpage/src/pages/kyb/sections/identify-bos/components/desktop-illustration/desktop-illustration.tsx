import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const DesktopIllustration = () => (
  <Grid>
    <ImageContainer>
      <Image src="/kyb/verify-people/basic-data.png" alt="Basic Data" width={320} height={650} />
    </ImageContainer>
    <ImageContainer>
      <Image src="/kyb/verify-people/residential-address.png" alt="Residential Address" width={320} height={650} />
    </ImageContainer>
    <ImageContainer>
      <Image src="/kyb/verify-people/app-clip.png" alt="App Clip" width={320} height={650} />
    </ImageContainer>
  </Grid>
);

const Grid = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: grid;
      padding-right: ${theme.spacing[9]};
      grid-template-rows: 1fr;
      gap: ${theme.spacing[6]};
      mask: linear-gradient(180deg, black 0%, black 75%, transparent 100%);
      mask-mode: alpha;
      height: 660px;
      align-items: center;
      justify-content: center;
      grid-template-columns: 1fr 1fr 1fr;
    `}
  `}
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
    img {
      object-fit: contain;
      width: 100%;
      height: 100%;
    }
  `}
`;

export default DesktopIllustration;
