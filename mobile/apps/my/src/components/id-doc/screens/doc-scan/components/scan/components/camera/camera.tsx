import styled, { css } from '@onefootprint/styled';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  Camera as VisionCamera,
  PhotoFile,
  useCameraDevices,
} from 'react-native-vision-camera';

import type { CameraType } from '../../scan.types';
import CaptureButton from './components/capture-button';
import Feedback from './components/feedback';
import Flash from './components/flash';
import Header from './components/header';

let timerId: NodeJS.Timeout | null = null;

type CameraProps = {
  disabled?: boolean;
  feedback?: string;
  frameProcessor?: any;
  isObjectDetected?: boolean;
  onPhotoTaken: (photo: PhotoFile) => void;
  title: string;
  type?: CameraType;
};

const Camera = ({
  disabled = false,
  feedback,
  frameProcessor,
  isObjectDetected,
  onPhotoTaken,
  title,
  type = 'back',
}: CameraProps) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const camera = useRef<VisionCamera>(null);
  const devices = useCameraDevices();
  const device = devices[type];
  const zoom = device?.neutralZoom;

  useEffect(() => {
    if (isObjectDetected) {
      timerId = setTimeout(takePhoto, 600);
      return () => clearTimeout(timerId);
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
    const newPhoto = await camera.current.takePhoto({});
    onPhotoTaken(newPhoto);
    resetAutoCapture();
    setIsFlashing(false);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <CameraContainer>
        <Header>{title}</Header>
        {device && (
          <StyledCamera
            device={device}
            frameProcessor={frameProcessor}
            isActive={!disabled}
            photo
            ref={camera}
            zoom={zoom}
          />
        )}
        {isFlashing ? <Flash /> : null}
        <Buttons>
          {feedback && <Feedback>{feedback}</Feedback>}
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
