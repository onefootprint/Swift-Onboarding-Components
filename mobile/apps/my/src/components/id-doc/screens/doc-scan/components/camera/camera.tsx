import { IcoBolt24, Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Button,
  Container,
  FadeIn,
  FeedbackButton,
  Image,
  Typography,
} from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import {
  Camera as VisionCamera,
  PhotoFile,
  useCameraDevices,
} from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';

import Instructions from '../instructions';
import type { CameraSize, CameraType } from './camera.types';
import encodeImagePath from './utils/encode-image-path';

let timerId: NodeJS.Timeout | null = null;

type CameraProps = {
  detector: any;
  disabled?: boolean;
  Frame?: ({ detector }: { detector: any }) => JSX.Element;
  frameProcessor?: any;
  instructions: { description?: string; IconComponent: Icon; title: string };
  isObjectDetected?: boolean;
  loading?: boolean;
  onSubmit: (encodedImage: string) => void;
  size?: CameraSize;
  subtitle?: string;
  success?: boolean;
  title: string;
  type?: CameraType;
};

const Camera = ({
  detector,
  disabled = false,
  Frame,
  frameProcessor,
  instructions,
  isObjectDetected,
  loading,
  onSubmit,
  size = 'default',
  subtitle,
  success,
  title,
  type = 'back',
}: CameraProps) => {
  const { t } = useTranslation('components.scan.camera');
  const camera = useRef<VisionCamera>(null);
  const devices = useCameraDevices();
  const device = devices[type];
  const [photo, setPhoto] = useState<PhotoFile | null>(null);

  const showActionButtons = photo;
  const showTakePhotoManuallyButton = !showActionButtons;
  const showInstructions = !photo;
  const showCamera = !photo && device;

  useEffect(() => {
    if (isObjectDetected) {
      timerId = setTimeout(takePhoto, 1250);
      return () => clearTimeout(timerId);
    }
  }, [isObjectDetected]);

  const takePhoto = async () => {
    if (!camera.current) return;
    resetAutoCapture();
    const newPhoto = await camera.current.takePhoto();
    setPhoto(newPhoto);
  };

  const resetAutoCapture = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const handleTakePhotoManually = () => {
    takePhoto();
  };

  const handleReset = () => {
    setPhoto(null);
  };

  const handleSubmit = async () => {
    if (!photo) return;
    const encodedImage = await encodeImagePath(photo.path);
    onSubmit(encodedImage);
  };

  return (
    <Container>
      <Box justifyContent="space-between" flex={1}>
        <Box>
          <Box center marginVertical={5}>
            <Typography variant="heading-3">{title}</Typography>
            <Typography variant="label-2">{subtitle}</Typography>
          </Box>
          <Box marginBottom={7}>
            {photo && (
              <Preview
                size={size}
                source={{ uri: photo.path }}
                resizeMode="cover"
              />
            )}
            {showCamera && (
              <CameraContainer size={size}>
                {Frame && <Frame detector={detector} />}
                <StyledCamera
                  device={device}
                  frameProcessor={frameProcessor}
                  isActive={!disabled}
                  photo
                  ref={camera}
                />
              </CameraContainer>
            )}
          </Box>
          {showInstructions && (
            <Instructions
              options={[
                {
                  icon: instructions.IconComponent,
                  title: instructions.title,
                  description: instructions.description,
                },
                { icon: IcoBolt24, title: t('instructions.capture') },
              ]}
            />
          )}
        </Box>
        {success ? (
          <Box gap={4}>
            <FeedbackButton>{t('cta-success')}</FeedbackButton>
            <Button disabled variant="secondary">
              {t('retake')}
            </Button>
          </Box>
        ) : (
          <>
            {showActionButtons && (
              <Box gap={4}>
                <Button
                  loading={loading}
                  loadingLabel={t('cta-loading')}
                  onPress={handleSubmit}
                >
                  {t('cta')}
                </Button>
                <Button
                  disabled={loading}
                  onPress={handleReset}
                  variant="secondary"
                >
                  {t('retake')}
                </Button>
              </Box>
            )}
            {showTakePhotoManuallyButton && (
              <FadeIn>
                <Button onPress={handleTakePhotoManually}>
                  {t('take-manually')}
                </Button>
              </FadeIn>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

const windowWidth = Dimensions.get('window').width;

const CameraContainer = styled.View<{ size: CameraSize }>`
  ${({ theme, size }) => css`
    align-items: center;
    background: ${theme.backgroundColor.senary};
    height: ${size === 'default' ? 280 : 390}px;
    justify-content: center;
    margin-left: -${theme.spacing[5]};
    position: relative;
    width: ${windowWidth}px;
  `}
`;

const StyledCamera = styled(VisionCamera)`
  height: 100%;
  width: 100%;
`;

const Preview = styled(Image)<{ size: CameraSize }>`
  ${({ theme, size }) => css`
    border-radius: ${theme.borderRadius.large};
    height: ${size === 'default' ? 260 : 390}px;
    margin-top: ${theme.spacing[7]};
    width: 100%;
  `}
`;

export default Camera;
