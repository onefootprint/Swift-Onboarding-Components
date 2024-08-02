import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

import { AUTOCAPTURE_TIMER_INTERVAL } from '../../../../constants';
import type { AutoCaptureKind } from '../../types';

type OverlayProps = {
  width: number; // Fits the size of video
  height: number;
  videoHeight: number;
  captureKind: AutoCaptureKind;
  outlineWidth: number;
  outlineHeight: number;
  timerAnimationVal?: number;
};

const NUM_MS_IN_SEC = 1000;

const Overlay = ({
  width,
  height,
  videoHeight,
  captureKind,
  outlineWidth,
  outlineHeight,
  timerAnimationVal,
}: OverlayProps) => (
  <Container width={width} height={height} $videoHeight={videoHeight}>
    {captureKind === 'face' && (
      <>
        <FullFrameOutline width={width} height={height} $outlineWidth={outlineWidth} $outlineHeight={outlineHeight}>
          {timerAnimationVal ? (
            <TimerAnimation
              key={timerAnimationVal}
              initial={{ opacity: 0 }}
              animate={{ opacity: [1, 0] }}
              transition={{
                type: 'tween',
                duration: AUTOCAPTURE_TIMER_INTERVAL / NUM_MS_IN_SEC,
              }}
            />
          ) : null}
        </FullFrameOutline>
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
    {(captureKind === 'idDoc' || captureKind === 'nonIdDoc') && (
      <FullFrameOutline
        width={width}
        height={height}
        $outlineWidth={outlineWidth}
        $outlineHeight={outlineHeight}
        data-show-border
      >
        {timerAnimationVal && (
          <TimerAnimation
            key={timerAnimationVal}
            initial={{ opacity: 0 }}
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: AUTOCAPTURE_TIMER_INTERVAL / 1000,
            }}
          />
        )}
      </FullFrameOutline>
    )}
  </Container>
);

const Container = styled.div<{
  width: number;
  height: number;
  $videoHeight: number;
}>`
  ${({ width, theme, $videoHeight }) => css`
    position: relative;
    width: ${width}px;
    height: ${$videoHeight}px;
    margin-top: calc(-1 * ${$videoHeight}px); // Show overlay on top of the video
    overflow: hidden;
    border-radius: ${theme.borderRadius.default};
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
      right: ${corner === 'top-right' || corner === 'bottom-right' ? 0 : 'auto'};
      bottom: ${corner === 'bottom-left' || corner === 'bottom-right' ? 0 : 'auto'};
      border-radius: ${corner === 'top-left' ? theme.borderRadius.xl : 0}
        ${corner === 'top-right' ? theme.borderRadius.xl : 0}
        ${corner === 'bottom-right' ? theme.borderRadius.xl : 0}
        ${corner === 'bottom-left' ? theme.borderRadius.xl : 0};
      border-top: ${
        corner === 'top-left' || corner === 'top-right'
          ? `${theme.spacing[2]} solid ${theme.backgroundColor.primary}`
          : 0
      };
      border-left: ${
        corner === 'top-left' || corner === 'bottom-left'
          ? `${theme.spacing[2]} solid ${theme.backgroundColor.primary}`
          : 0
      };
      border-right: ${
        corner === 'top-right' || corner === 'bottom-right'
          ? `${theme.spacing[2]} solid ${theme.backgroundColor.primary}`
          : 0
      };
      border-bottom: ${
        corner === 'bottom-left' || corner === 'bottom-right'
          ? `${theme.spacing[2]} solid ${theme.backgroundColor.primary}`
          : 0
      };
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
    border-radius: ${theme.borderRadius.xl};
    box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.6);

    &[data-show-border='true'] {
      border: ${theme.spacing[2]} solid ${theme.backgroundColor.primary};
    }
  `}
`;

const TimerAnimation = styled(motion.div)`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    border-radius: ${theme.borderRadius.xl};
    background: #00000080;
  `}
`;

export default Overlay;
