import React from 'react';
import styled, { css } from 'styled-components';

import Line from '../components/line';
import Background from './components/background';

type OtherComponentsIllustrationProps = {
  isHovered?: boolean;
};

const OtherComponentsIllustration = ({ isHovered = false }: OtherComponentsIllustrationProps) => (
  <Container>
    <StyledBackground isHovered={isHovered} />
    <CardBack $isHovered={isHovered}>
      <Dots>
        <Line darkColor="#303030" lightColor="#CDCDCD" top="10px" left="0%" width={10} height={10} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="10px" left="50%" width={10} height={10} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="10px" left="100%" width={10} height={10} />
      </Dots>
      <Screen $isHovered={isHovered}>
        <Line darkColor="#303030" lightColor="#CDCDCD" top="40px" left="50%" width={80} />
        <Subsection>
          <Line darkColor="#A38BFF" lightColor="#4A24DB" top="14px" left="80%" width={40} />
        </Subsection>
      </Screen>
    </CardBack>
  </Container>
);

const StyledBackground = styled(Background)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Subsection = styled.div`
  ${({ theme }) => css`
    width: 200px;
    height: 200px;
    position: absolute;
    left: 50%;
    top: 60%;
    transform: translateX(-50%);
    border-radius: 6px;
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const Dots = styled.div`
  position: absolute;
  top: 0;
  left: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 2px;
  width: 32px;
  height: 30px;
`;

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: relative;
    padding: ${theme.spacing[7]} ${theme.spacing[8]} 0 ${theme.spacing[8]};
    background: linear-gradient(
      180deg,
      ${theme.backgroundColor.primary} 0%,
      #fffaed40 200%
    );
  `}
`;

const CardBack = styled.div<{ $isHovered: boolean }>`
  ${({ theme, $isHovered }) => css`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 7px;
    background: radial-gradient(
      100% 100% at 50% 80%,
      ${theme.backgroundColor.secondary} 0%,
      ${theme.backgroundColor.primary} 100%
    );
    padding: ${theme.spacing[8]} ${theme.spacing[6]} 0 ${theme.spacing[6]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    transition: all 0.2s ease-in-out;

    ${
      $isHovered &&
      css`
      box-shadow: ${theme.elevation[3]};
      transform: translateY(-2px);
    `
    }
  `}
`;

const Screen = styled.div<{ $isHovered: boolean }>`
  ${({ theme, $isHovered }) => css`
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 6px;
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    ${
      $isHovered &&
      css`
      box-shadow: ${theme.elevation[1]};
      transform: translateY(-2px);
    `
    }
  `}
`;

export default OtherComponentsIllustration;
