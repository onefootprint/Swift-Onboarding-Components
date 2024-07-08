import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const DesktopIllustration = () => (
  <Grid>
    <ImageContainer data-grid-area="hey-there">
      <StyledImage src="/kyb/verify-businesses/hey-there.png" alt="Basic Data" width={800} height={800} priority />
      <StyledImage src="/kyb/verify-businesses/basic-data.png" alt="Basic Data" width={800} height={800} priority />
    </ImageContainer>
    <ImageContainer data-grid-area="business-address">
      <StyledImage
        src="/kyb/verify-businesses/business-address.png"
        alt="App Clip"
        width={800}
        height={800}
        data-grid-area="business-address"
        priority
      />
    </ImageContainer>
    <ImageContainer data-grid-area="bos">
      <StyledImage src="/kyb/verify-businesses/bos.png" alt="Residential Address" width={800} height={800} />
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
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: auto;
`;

export default DesktopIllustration;
