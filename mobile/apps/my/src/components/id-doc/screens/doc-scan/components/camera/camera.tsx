import { useEffect, useRef, useState } from 'react';
import { Camera as VisionCamera, useCameraDevice } from 'react-native-vision-camera';
import styled, { css } from 'styled-components/native';
import { useTimeout } from 'usehooks-ts';

import haptic from '@/utils/haptic';

import type { Detection, Document } from '../../doc-scan.types';
import type { CameraType } from './camera.types';
import CaptureButton from './components/capture-button';
import Feedback from './components/feedback';
import Flash from './components/flash';
import Header from './components/header';
import useCameraCountdown from './hooks/use-camera-countdown';

const AUTO_CAPTURE_TIMEOUT = 3500;

type CameraProps = {
  children?: (countdown: number | null) => React.ReactNode;
  disabled?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  frameProcessor?: any;
  object: Detection;
  onBack?: () => void;
  onSubmit?: (doc: Document) => void;
  subtitle?: string;
  title: string;
  type?: CameraType;
  onCapture: () => void;
};

const Camera = ({
  children,
  disabled = false,
  frameProcessor,
  object,
  onBack,
  onSubmit,
  subtitle,
  title,
  type = 'back',
  onCapture,
}: CameraProps) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const camera = useRef<VisionCamera>(null);
  const [showFeedback, setShowFeedback] = useState(true);
  const [isAutoCaptureEnabled, setIsAutoCaptureEnabled] = useState(false);
  useTimeout(() => {
    setIsAutoCaptureEnabled(true);
  }, AUTO_CAPTURE_TIMEOUT);

  const device = useCameraDevice(
    type,
    type === 'back'
      ? {
          physicalDevices: ['wide-angle-camera', 'telephoto-camera'],
        }
      : undefined,
  );

  const cameraDetection = useCameraCountdown({
    disabled: !isAutoCaptureEnabled,
    object,
    onDone: () => {
      takePhoto({ manual: false });
    },
  });
  const showCountdown = cameraDetection.countdown && cameraDetection.countdown <= 3;

  useEffect(() => {
    return () => cameraDetection.reset();
  }, []);

  const takePhoto = async (meta: Record<string, boolean>) => {
    if (!camera.current) {
      return;
    }

    onCapture();
    setIsFlashing(true);
    setShowFeedback(false);
    const newPhoto = await camera.current.takePhoto({
      qualityPrioritization: 'balanced',
    });
    onSubmit?.({
      photo: newPhoto,
      meta: {
        ...meta,
        ...object.data,
      },
    });
    setIsFlashing(false);
  };

  const handleTakePhotoManually = () => {
    if (showCountdown) {
      cameraDetection.reset();
      setIsAutoCaptureEnabled(false);
      setTimeout(() => {
        setIsAutoCaptureEnabled(true);
      }, 1000);
    } else {
      haptic.trigger('impactHeavy');
      takePhoto({ manual: true });
    }
  };

  return (
    <CameraContainer>
      {subtitle ? (
        <Header onBack={onBack}>
          {title} - {subtitle}
        </Header>
      ) : (
        <Header onBack={onBack}>{title}</Header>
      )}
      {device && (
        <StyledCamera
          device={device}
          frameProcessor={frameProcessor}
          isActive={!disabled}
          photo
          ref={camera}
          pixelFormat="yuv"
        />
      )}
      {children?.(showCountdown ? cameraDetection.countdown : null)}
      {isFlashing ? <Flash /> : null}
      <Buttons>
        {isAutoCaptureEnabled && showFeedback ? (
          <>
            {object.feedback && cameraDetection.countdown < 3 && <Feedback>{object.feedback}</Feedback>}
            {object.isDetected && cameraDetection.countdown > 3 && <Feedback>Hold still...</Feedback>}
          </>
        ) : null}
        {showFeedback ? (
          <CaptureButton
            onPress={handleTakePhotoManually}
            selected={cameraDetection.countdown && cameraDetection.countdown <= 3}
          />
        ) : null}
      </Buttons>
    </CameraContainer>
  );
};

const CameraContainer = styled.View`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.senary};
    position: relative;
    width: 100%;
    align-items: center;
  `}
`;

const StyledCamera = styled(VisionCamera)`
  height: 100%;
  width: 100%;
  position: relative;
`;

const Buttons = styled.View`
  ${({ theme }) => css`
    align-items: center;
    bottom: ${theme.spacing[7]};
    gap: ${theme.spacing[7]};
    margin-bottom: ${theme.spacing[8]};
    position: absolute;
  `}
`;

export default Camera;
