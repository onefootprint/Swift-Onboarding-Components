import { Box } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';
import Phone from './components/phone';

const OnfidoIllustration = () => {
  return (
    <Container>
      <PositionedPhone />
      <Shadow />
    </Container>
  );
};

const Container = styled(Box)`
  width: 100%;
  height: 100%;
`;

const PositionedPhone = styled(Phone)`
${({ theme }) => css`
    position: absolute;
    left: 50%;
    transform: translateX(-50%) scale(.75);
    transform-origin: top center;
    top: ${theme.spacing[7]};
    z-index: 1;
  `}
`;

const Shadow = styled(Box)`
${({ theme }) => css`
    position: absolute;
    left: 50%;
    z-index: 0;
    transform: translateX(-50%) scale(.75);
    transform-origin: top center;
    top: ${theme.spacing[7]};
    width: 220px;
    height: 700px;
    background-color: black;
    border-radius: 32px;
    box-shadow: ${theme.elevation[3]};
    filter: blur(10px);
    opacity: .4;
    @media not all and (min-resolution:.001dpcm) { 
      @supports (-webkit-appearance:none) {
        filter: blur(20px);
      }
    }
  `}
`;

export default OnfidoIllustration;
