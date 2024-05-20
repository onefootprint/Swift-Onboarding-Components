import { Box } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

export const RequestMoreInfo = () => (
  <IllustrationContainer>
    <StyledImage
      src="/industries/featured-cards/request-more-info/dialog.svg"
      alt="scores table"
      width={314 * 2}
      height={111 * 2}
    />
  </IllustrationContainer>
);

const IllustrationContainer = styled(Box)`
  width: 100%;
  height: 100%;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: url('/industries/featured-cards/request-more-info/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: repeat;
  background-size: 120% 120%;
  mask: linear-gradient(to bottom, black 0%, black 70%, transparent 100%);
  mask-size: 100% 100%;
  mask-position: center;
  mask-repeat: repeat;
  mask-type: alpha;
`;

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    transform: translateX(-50%) rotate(-5deg);
    box-shadow: ${theme.elevation[3]};
    top: 15%;
    left: 55%;
    width: 324px;
    height: auto;
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    z-index: 1;
  `}
`;

export default RequestMoreInfo;
