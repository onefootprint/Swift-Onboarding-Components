import { useTheme } from 'next-themes';
import React from 'react';
import styled, { css } from 'styled-components';

type LineProps = {
  lightColor: string;
  darkColor: string;
  width: number;
  height?: number;
  top: string;
  left: string;
};

const Line = ({ lightColor, darkColor, width, height = 8, top, left }: LineProps) => {
  const { theme } = useTheme();
  const color = theme === 'light' ? lightColor : darkColor;
  return <Container color={color} width={width} height={height} top={top} left={left} />;
};

const Container = styled.div<{
  color: string;
  width: number;
  height: number;
  top: string;
  left: string;
}>`
  ${({ theme, color, width, height = 8, top, left }) => css`
    position: absolute;
    top: ${top};
    left: ${left};
    transform: translateX(-50%);
    height: ${height}px;
    width: ${width}px;
    background-color: ${color};
    border-radius: ${theme.borderRadius.full};
  `}
`;

export default Line;
