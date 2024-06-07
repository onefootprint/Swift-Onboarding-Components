import React from 'react';
import styled, { css } from 'styled-components';

type BaseillustrationSectionTitleProps = {
  children: React.ReactNode;
  height?: number;
  width?: number;
  removeMask?: boolean;
};

const IllustrationSectionTitle = ({
  height = 174,
  width = 360,
  removeMask,
  children,
}: BaseillustrationSectionTitleProps) => (
  <Outer height={height} width={width} removeMask={removeMask}>
    <Inner>
      <Mask>{children}</Mask>
    </Inner>
  </Outer>
);

const Outer = styled.div<{
  height?: number;
  width?: number;
  removeMask?: boolean;
}>`
  ${({ theme, height, width, removeMask }) => css`
    z-index: 0;
    position: relative;
    border-radius: 10px 10px 0;
    background: radial-gradient(
      100% 100% at 50% 0%,
      ${theme.borderColor.primary} 0%,
      ${theme.backgroundColor.primary} 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1px 1px 0 1px;
    height: ${height}px;
    width: ${width}px;

    ${
      !removeMask &&
      css`
      mask: radial-gradient(
        100% 100% at 50% 0%,
        black 0%,
        black 50%,
        transparent 100%
      );
      mask-mode: alpha;
    `
    }
  `};
`;

const Inner = styled.div`
  ${({ theme }) => css`
    position: relative;
    z-index: 1;
    border-radius: 10px 10px 0;
    background-color: ${theme.backgroundColor.primary};
    width: 100%;
    height: 100%;

    &::before {
      z-index: 2;
      content: '';
      position: absolute;
      pointer-events: none;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      border-radius: 10px 10px 0;
      background-blend-mode: overlay;
      background: radial-gradient(
        100% 100% at 50% 0%,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 100%
      );
    }
  `}
`;

const Mask = styled.div`
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;

  mask-mode: alpha;
  mask: radial-gradient(
    100% 100% at 50% 0%,
    black 0%,
    black 50%,
    transparent 100%
  );
`;

export default IllustrationSectionTitle;
