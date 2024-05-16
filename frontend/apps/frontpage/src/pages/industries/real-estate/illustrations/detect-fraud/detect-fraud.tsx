import { Box } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

export const DetectFraud = () => (
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
`;

const ScoresTable = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    transform: translate(-50%, -50%) rotate(-10deg);
    box-shadow: ${theme.elevation[1]};
    top: 50%;
    left: 30%;
    width: 324px;
    height: auto;
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    z-index: 1;
  `}
`;

const Renters = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    bottom: 0;
    box-shadow: ${theme.elevation[3]};
    right: -10%;
    width: 300px;
    transform: rotate(4deg);
    height: auto;
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    z-index: 2;
  `}
`;

const UploadSource = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    width: 264px;
    height: auto;
    left: 0;
    top: 10%;
    transform: translateY(-50%) rotate(4deg);
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[1]};
    z-index: 0;
  `}
`;

export default DetectFraud;
