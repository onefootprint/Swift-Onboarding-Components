import styled, { css } from '@onefootprint/styled';
import { StatusBar } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import {
  Camera as VisionCamera,
  PhotoFile,
  useCameraDevices,
} from 'react-native-vision-camera';

import type { ScanType } from '../../scan.types';
import CaptureButton from './components/capture-button';
import Feedback from './components/feedback';
import Flash from './components/flash';
import Header from './components/header';

let timerId: NodeJS.Timeout | null = null;

type CameraProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  feedback?: string;
  frameProcessor?: any;
  isObjectDetected?: boolean;
  onPhotoTaken: (photo: PhotoFile) => void;
  subtitle?: string;
  title: string;
  type?: ScanType;
};

const AUTO_CAPTURE_DELAY = 750;

const Camera = ({
  children,
  disabled = false,
  feedback,
  frameProcessor,
  isObjectDetected,
  onPhotoTaken,
  subtitle,
  title,
  type = 'back',
}: CameraProps) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const camera = useRef<VisionCamera>(null);
  const [showFeedback, setShowFeedback] = useState(true);
  const devices = useCameraDevices('wide-angle-camera');
  const device = devices[type];

  useEffect(() => {
    if (isObjectDetected) {
      timerId = setTimeout(takePhoto, AUTO_CAPTURE_DELAY);
      return () => clearTimeout(timerId);
    } else {
      resetAutoCapture();
    }
  }, [isObjectDetected]);

  const resetAutoCapture = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const takePhoto = async () => {
    if (!camera.current) return;
    setIsFlashing(true);
    setShowFeedback(false);
    const newPhoto = await camera.current.takePhoto({});
    resetAutoCapture();
    onPhotoTaken(newPhoto);
    setIsFlashing(false);
  };

  return (
    <>
      <StatusBar variant={disabled ? 'default' : 'on-camera'} />
      <CameraContainer>
        {subtitle ? (
          <Header>
            {title} - {subtitle}
          </Header>
        ) : (
          <Header>{title}</Header>
        )}
        {device && (
          <StyledCamera
            device={device}
            frameProcessor={frameProcessor}
            isActive={!disabled}
            photo
            ref={camera}
          />
        )}
        {children}
        {isFlashing ? <Flash /> : null}
        <Buttons>
          {showFeedback && feedback && <Feedback>{feedback}</Feedback>}
          <CaptureButton onPress={takePhoto} />
        </Buttons>
      </CameraContainer>
    </>
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
