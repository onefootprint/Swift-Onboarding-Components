import React from 'react';
import styled, { css } from 'styled-components';

type OverlayProps = {
  width: number; // Fits the size of video
  height: number;
  faceOutlineByHeightRatio: number; // The ratio = length of the each side of the square face outline box / height of the full image
};

const Overlay = ({ width, height, faceOutlineByHeightRatio }: OverlayProps) => (
  <Container width={width} height={height}>
    <FaceOutline
      sideLength={faceOutlineByHeightRatio * height}
      corner="top-left"
    />
    <FaceOutline
      sideLength={faceOutlineByHeightRatio * height}
      corner="top-right"
    />
    <FaceOutline
      sideLength={faceOutlineByHeightRatio * height}
      corner="bottom-left"
    />
    <FaceOutline
      sideLength={faceOutlineByHeightRatio * height}
      corner="bottom-right"
    />
  </Container>
);

const Container = styled.div<{ width: number; height: number }>`
  ${({ width, height, theme }) => css`
    position: relative;
    width: ${width}px;
    height: ${height}px;
    margin-top: calc(
      -${height}px - ${theme.spacing[5]}
    ); // Show overlay on top of the video
  `}
`;

const FaceOutline = styled.div<{ sideLength: number; corner: string }>`
  ${({ sideLength, corner, theme }) => css`
    top: 15%;
    left: 50%;
    transform: translate(-50%, 0); // Centers over video
    height: ${sideLength}px;
    width: ${sideLength}px;
    position: absolute;

    &::before {
      content: ' ';
      position: absolute;
      width: ${sideLength / 4}px;
      height: ${sideLength / 4}px;
      top: ${corner === 'top-left' || corner === 'top-right' ? 0 : 'auto'};
      left: ${corner === 'top-left' || corner === 'bottom-left' ? 0 : 'auto'};
      right: ${corner === 'top-right' || corner === 'bottom-right'
        ? 0
        : 'auto'};
      bottom: ${corner === 'bottom-left' || corner === 'bottom-right'
        ? 0
        : 'auto'};
      border-radius: ${corner === 'top-left' ? theme.borderRadius.large : 0}
        ${corner === 'top-right' ? theme.borderRadius.large : 0}
        ${corner === 'bottom-right' ? theme.borderRadius.large : 0}
        ${corner === 'bottom-left' ? theme.borderRadius.large : 0};
      border-top: ${corner === 'top-left' || corner === 'top-right'
        ? `${theme.spacing[2]} solid ${theme.backgroundColor.primary}`
        : 0};
      border-left: ${corner === 'top-left' || corner === 'bottom-left'
        ? `${theme.spacing[2]} solid ${theme.backgroundColor.primary}`
        : 0};
      border-right: ${corner === 'top-right' || corner === 'bottom-right'
        ? `${theme.spacing[2]} solid ${theme.backgroundColor.primary}`
        : 0};
      border-bottom: ${corner === 'bottom-left' || corner === 'bottom-right'
        ? `${theme.spacing[2]} solid ${theme.backgroundColor.primary}`
        : 0};
    }
  `}
`;

export default Overlay;
