import styled, { css } from '@onefootprint/styled';
import { StatusBar } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import {
  Camera as VisionCamera,
  useCameraDevices,
} from 'react-native-vision-camera';

import type { ScanObject, ScanPicture, ScanType } from '../../scan.types';
import CaptureButton from './components/capture-button';
import Feedback from './components/feedback';
import Flash from './components/flash';
import Header from './components/header';

let timerId: NodeJS.Timeout | null = null;

type CameraProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  frameProcessor?: any;
  object: ScanObject;
  onBack?: () => void;
  onPhotoTaken: (picture: ScanPicture) => void;
  subtitle?: string;
  title: string;
  type?: ScanType;
};

const AUTO_CAPTURE_DELAY = 900;

const Camera = ({
  children,
  disabled = false,
  frameProcessor,
  object,
  onBack,
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
    if (object.isDetected) {
      timerId = setTimeout(() => {
        takePhoto({ manual: false });
      }, AUTO_CAPTURE_DELAY);
      return () => clearTimeout(timerId);
    } else {
      resetAutoCapture();
    }
  }, [object.isDetected]);

  const resetAutoCapture = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const takePhoto = async (meta: Record<string, boolean>) => {
    if (!camera.current) return;
    setIsFlashing(true);
    setShowFeedback(false);
    const newPhoto = await camera.current.takePhoto({
      qualityPrioritization: 'balanced',
    });
    resetAutoCapture();
    onPhotoTaken({
      photo: newPhoto,
      meta: {
        ...meta,
        ...object.data,
      },
    });
    setIsFlashing(false);
  };

  return (
    <>
      <StatusBar variant={disabled ? 'default' : 'on-camera'} />
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
          />
        )}
        {children}
        {isFlashing ? <Flash /> : null}
        <Buttons>
          {showFeedback && object.feedback && (
            <Feedback>{object.feedback}</Feedback>
          )}
          <CaptureButton
            onPress={() => {
              takePhoto({ manual: true });
            }}
          />
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
