import styled, { css } from '@onefootprint/styled';
import { StatusBar, Typography } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import {
  Camera as VisionCamera,
  useCameraDevice,
} from 'react-native-vision-camera';

import haptic from '@/utils/haptic';

import type { ScanObject, ScanPicture, ScanType } from '../../scan.types';
import CaptureButton from './components/capture-button';
import Feedback from './components/feedback';
import Flash from './components/flash';
import Header from './components/header';
import useCameraCountdown from './hooks/use-camera-countdown';

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
  const device = useCameraDevice(
    type,
    type === 'back'
      ? {
          physicalDevices: ['wide-angle-camera', 'telephoto-camera'],
        }
      : undefined,
  );
  const cameraDetection = useCameraCountdown(object, () => {
    takePhoto({ manual: false });
  });

  useEffect(() => {
    return () => cameraDetection.reset();
  }, []);

  const takePhoto = async (meta: Record<string, boolean>) => {
    if (!camera.current) {
      return;
    }

    setIsFlashing(true);
    setShowFeedback(false);
    const newPhoto = await camera.current.takePhoto({
      qualityPrioritization: 'balanced',
    });
    onPhotoTaken({
      photo: newPhoto,
      meta: {
        ...meta,
        ...object.data,
      },
    });
    setIsFlashing(false);
  };

  const handleTakePhotoManually = () => {
    haptic.trigger('impactHeavy');
    takePhoto({ manual: true });
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
          {showFeedback && (
            <>
              {cameraDetection.countdown ? (
                <Countdown>
                  {cameraDetection.countdown === 5 ||
                  cameraDetection.countdown === 4 ? (
                    <Typography variant="label-4" color="quinary">
                      Hold still...
                    </Typography>
                  ) : (
                    <Typography variant="display-3" color="quinary">
                      {cameraDetection.countdown}
                    </Typography>
                  )}
                </Countdown>
              ) : null}
              {object.feedback && !cameraDetection.countdown && (
                <Feedback>{object.feedback}</Feedback>
              )}
            </>
          )}
          <CaptureButton onPress={handleTakePhotoManually} />
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

const Countdown = styled.View`
  ${({ theme }) => css`
    background: rgba(0, 0, 0, 0.35);
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
  `}
`;

export default Camera;
