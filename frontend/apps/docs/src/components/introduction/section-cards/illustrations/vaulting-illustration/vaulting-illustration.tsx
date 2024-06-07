import React from 'react';
import styled, { css } from 'styled-components';

import Line from '../components/line';
import Background from './components/background';

type VaultingIllustrationProps = {
  isHovered?: boolean;
};

const linesCore = [
  {
    x: 50,
    y: 12,
    width: 48,
    height: 12,
    lightColor: '#eeeeee',
    darkColor: '#303030',
  },
  {
    x: 120,
    y: 13,
    width: 46,
    height: 10,
    lightColor: '#0A6A4A',
    darkColor: '#9BFFDE',
  },
  {
    x: 180,
    y: 12,
    width: 36,
    height: 12,
    lightColor: '#eeeeee',
    darkColor: '#303030',
  },
  {
    x: 240,
    y: 12,
    width: 41,
    height: 12,
    lightColor: '#eeeeee',
    darkColor: '#303030',
  },
];

const VaultingIllustration = ({ isHovered = false }: VaultingIllustrationProps) => (
  <Container>
    <StyledBackground isHovered={isHovered} />
    <Screen isHovered={isHovered}>
      <Heading />
      <Core>
        {linesCore.map(line => (
          <Line
            key={line.x * line.y}
            lightColor={line.lightColor}
            darkColor={line.darkColor}
            top={`${line.y}px`}
            left={`${line.x}px`}
            width={line.width}
            height={line.height}
          />
        ))}
        {linesCore.map(line => (
          <Line
            key={line.x * line.y}
            lightColor={line.x === 120 ? '#991008' : line.lightColor}
            darkColor={line.x === 120 ? '#FF938C' : line.darkColor}
            top={`${line.y + 30}px`}
            left={`${line.x}px`}
            width={line.width}
            height={line.height}
          />
        ))}
        {linesCore.map(line => (
          <Line
            key={line.x * line.y}
            lightColor={line.lightColor}
            darkColor={line.darkColor}
            top={`${line.y + 60}px`}
            left={`${line.x}px`}
            width={line.width}
            height={line.height}
          />
        ))}
        {linesCore.map(line => (
          <Line
            key={line.x * line.y}
            lightColor={line.lightColor}
            darkColor={line.darkColor}
            top={`${line.y + 90}px`}
            left={`${line.x}px`}
            width={line.width}
            height={line.height}
          />
        ))}
      </Core>
    </Screen>
  </Container>
);

const Core = styled.div`
  position: relative;
`;

const Heading = styled.div`
  ${({ theme }) => css`
    height: 24px;
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: relative;
    padding: ${theme.spacing[7]} ${theme.spacing[8]} 0 ${theme.spacing[8]};
  `}
`;

const Screen = styled.div<{ isHovered: boolean }>`
  ${({ theme, isHovered }) => css`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 7px;
    background: radial-gradient(
      100% 100% at 50% 80%,
      ${theme.backgroundColor.secondary} 0%,
      ${theme.backgroundColor.primary} 100%
    );
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    overflow: hidden;
    transition: all 0.2s ease-in-out;

    ${
      isHovered &&
      css`
      box-shadow: ${theme.elevation[3]};
      transform: translateY(-2px);
    `
    }
  `}
`;

const StyledBackground = styled(Background)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

export default VaultingIllustration;
