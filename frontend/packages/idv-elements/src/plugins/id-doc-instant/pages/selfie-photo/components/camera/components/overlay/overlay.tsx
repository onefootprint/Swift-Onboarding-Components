import React from 'react';
import styled, { css } from 'styled-components';

type OverlayProps = {
  width: number; // Fits the size of video
  height: number;
};

const Overlay = ({ width, height }: OverlayProps) => (
  <Container width={width} height={height}>
    <FaceOutline />
  </Container>
);

const Container = styled.div<{ width: number; height: number }>`
  ${({ width, height }) => css`
    position: relative;
    width: ${width}px;
    height: ${height}px;
    margin-top: -${height}px; // Show overlay on top of the video
  `}
`;

const FaceOutline = styled.div`
  ${({ theme }) => css`
    border: 1px solid ${theme.borderColor.tertiary};
    top: 15%;
    padding-left: 70%; // Maintains an aspect ratio
    left: 50%;
    transform: translate(-50%, 0); // Centers over video
    border-radius: 50%;
    height: 70%;
    position: absolute;
  `}
`;

export default Overlay;
