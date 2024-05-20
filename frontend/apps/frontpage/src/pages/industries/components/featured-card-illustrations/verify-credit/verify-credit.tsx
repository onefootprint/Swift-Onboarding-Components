import { Box } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

export const VerifyIdentities = () => (
  <IllustrationContainer>
    <ScoresTable
      src="/industries/featured-cards/detect-fraud/scores.svg"
      alt="scores table"
      width={314 * 2}
      height={111 * 2}
    />
    <Renters
      src="/industries/featured-cards/detect-fraud/renter.svg"
      alt="scores table"
      width={191 * 2}
      height={54 * 2}
    />
    <UploadSource
      src="/industries/featured-cards/detect-fraud/upload.svg"
      alt="uploads"
      width={264 * 2}
      height={30 * 2}
    />
  </IllustrationContainer>
);

const IllustrationContainer = styled(Box)`
  width: 100%;
  height: 100%;
  position: relative;
  isolation: isolate;
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

const ScoresTable = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    transform: translate(-50%, -50%) rotate(-10deg);
    box-shadow: ${theme.elevation[2]};
    top: 50%;
    left: 40%;
    width: 324px;
    height: auto;
    border-radius: ${theme.borderRadius.default};
    z-index: 1;
  `}
`;

const Renters = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    bottom: 0;
    box-shadow: ${theme.elevation[1]};
    right: -10%;
    width: 300px;
    transform: rotate(4deg);
    height: auto;
    border-radius: ${theme.borderRadius.default};
    z-index: 0;
  `}
`;

const UploadSource = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    width: 264px;
    height: auto;
    left: 2%;
    top: 10%;
    transform: translateY(-50%) rotate(4deg);
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[1]};
    z-index: 0;
  `}
`;

export default VerifyIdentities;
