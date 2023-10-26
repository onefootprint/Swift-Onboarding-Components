import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';

import {
  AUTOCAPTURE_TIMER_INTERVAL,
  FRAME_INSTRUCTION_TRANSITION_DELAY,
} from '../../../../constants/transition-delay.constants';
import type { AutocaptureKind } from '../../hooks/use-auto-capture';

type OverlayProps = {
  width: number; // Fits the size of video
  height: number;
  videoHeight: number;
  captureKind: AutocaptureKind;
  outlineWidth: number;
  outlineHeight: number;
  isCameraVisible: boolean;
  timerAnimationVal?: number;
};

const transitionDelayInSeconds = FRAME_INSTRUCTION_TRANSITION_DELAY / 1000;

const overlayBackgroundVariants = {
  visible: { backgroundColor: '#FFFFFFCC' },
  hidden: {
    opacity: [1, 0],
    transition: {
      type: 'tween',
      duration: transitionDelayInSeconds,
      times: [0.75, 1],
    },
  },
};

const Overlay = ({
  width,
  height,
  videoHeight,
  captureKind,
  outlineWidth,
  outlineHeight,
  isCameraVisible,
  timerAnimationVal,
}: OverlayProps) => {
  const { t } = useTranslation('components.camera.overlay');
  return (
    <Container width={width} height={height} videoHeight={videoHeight}>
      {captureKind === 'face' && (
        <>
          <FullFrameOutline
            width={width}
            height={height}
            $outlineWidth={outlineWidth}
            $outlineHeight={outlineHeight}
          >
            <InstructionContainer
              initial="visible"
              animate={isCameraVisible ? 'hidden' : ''}
              variants={overlayBackgroundVariants}
            >
              <Typography variant="label-3" sx={{ textAlign: 'center' }}>
                {t('face.title')}
              </Typography>
              <Typography variant="body-3" sx={{ textAlign: 'center' }}>
                {t('face.subtitle')}
              </Typography>
            </InstructionContainer>
            {timerAnimationVal && (
              <TimerAnimation
                key={timerAnimationVal}
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0] }}
                transition={{
                  type: 'tween',
                  duration: AUTOCAPTURE_TIMER_INTERVAL / 1000,
                }}
              />
            )}
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
      {captureKind === 'document' && (
        <FullFrameOutline
          width={width}
          height={height}
          $outlineWidth={outlineWidth}
          $outlineHeight={outlineHeight}
          data-show-border
        >
          <InstructionContainer
            initial="visible"
            animate={isCameraVisible ? 'hidden' : ''}
            variants={overlayBackgroundVariants}
          >
            <Typography variant="label-3" sx={{ textAlign: 'center' }}>
              {t('document.title')}
            </Typography>
            <Typography variant="body-3" sx={{ textAlign: 'center' }}>
              {t('document.subtitle')}
            </Typography>
          </InstructionContainer>
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
};

const Container = styled.div<{
  width: number;
  height: number;
  videoHeight: number;
}>`
  ${({ width, theme, videoHeight }) => css`
    position: relative;
    width: ${width}px;
    height: ${videoHeight}px;
    margin-top: calc(-1 * ${videoHeight}px); // Show overlay on top of the video
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
    border-radius: ${theme.borderRadius.large};
    box-shadow: 0 0 0 1000px #0000004d;

    &[data-show-border='true'] {
      border: ${theme.spacing[2]} solid ${theme.backgroundColor.primary};
    }
  `}
`;

const InstructionContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: calc(2 * ${theme.borderRadius.default});
  `}
`;

const TimerAnimation = styled(motion.div)`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    border-radius: ${theme.borderRadius.large};
    background: #00000080;
  `}
`;

export default Overlay;
