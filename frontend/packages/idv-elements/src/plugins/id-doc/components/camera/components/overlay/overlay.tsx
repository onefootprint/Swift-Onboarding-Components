import styled, { css } from '@onefootprint/styled';
import React from 'react';

export type OutlineKind = 'full-frame' | 'corner';

type OverlayProps = {
  width: number; // Fits the size of video
  height: number;
  outlineKind: OutlineKind;
  outlineWidth: number;
  outlineHeight: number;
};

const Overlay = ({
  width,
  height,
  outlineKind,
  outlineWidth,
  outlineHeight,
}: OverlayProps) => (
  <Container width={width} height={height}>
    {outlineKind === 'corner' && (
      <>
        <CornerOutline
          width={width}
          height={height}
          $outlineWidth={outlineWidth}
          $outlineHeight={outlineHeight}
          corner="top-left"
        />
        <CornerOutline
          width={width}
          height={height}
          $outlineWidth={outlineWidth}
          $outlineHeight={outlineHeight}
          corner="top-right"
        />
        <CornerOutline
          width={width}
          height={height}
          $outlineWidth={outlineWidth}
          $outlineHeight={outlineHeight}
          corner="bottom-left"
        />
        <CornerOutline
          width={width}
          height={height}
          $outlineWidth={outlineWidth}
          $outlineHeight={outlineHeight}
          corner="bottom-right"
        />
      </>
    )}
    {outlineKind === 'full-frame' && (
      <FullFrameOutline
        width={width}
        height={height}
        $outlineWidth={outlineWidth}
        $outlineHeight={outlineHeight}
      />
    )}
  </Container>
);

const Container = styled.div<{ width: number; height: number }>`
  ${({ width, height }) => css`
    position: relative;
    width: ${width}px;
    height: ${height}px;
    margin-top: calc(-1 * ${height}px); // Show overlay on top of the video
  `}
`;

const CornerOutline = styled.div<{
  width: number;
  height: number;
  $outlineWidth: number;
  $outlineHeight: number;
  corner: string;
}>`
  ${({ width, height, $outlineWidth, $outlineHeight, corner, theme }) => css`
    top: calc(${height / 2}px - ${$outlineHeight / 2}px);
    left: calc(${width / 2}px - ${$outlineWidth / 2}px);
    height: ${$outlineHeight}px;
    width: ${$outlineWidth}px;
    position: absolute;

    &::before {
      content: ' ';
      position: absolute;
      width: ${$outlineWidth / 4}px;
      height: ${$outlineHeight / 4}px;
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

const FullFrameOutline = styled.div<{
  width: number;
  height: number;
  $outlineWidth: number;
  $outlineHeight: number;
}>`
  ${({ width, height, $outlineWidth, $outlineHeight, theme }) => css`
    top: calc(${height / 2}px - ${$outlineHeight / 2}px);
    left: calc(${width / 2}px - ${$outlineWidth / 2}px);
    height: ${$outlineHeight}px;
    width: ${$outlineWidth}px;
    position: absolute;
    border: ${theme.spacing[2]} solid ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.large};
  `}
`;

export default Overlay;
