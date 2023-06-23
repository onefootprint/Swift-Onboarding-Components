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
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import {
  Camera as VisionCamera,
  PhotoFile,
  useCameraDevices,
} from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';

import Instructions from '../instructions';
import ScanContext from '../scan-context';
import type { CameraSize, CameraType } from './camera.types';
import Errors from './components/errors';
import Warning from './components/warning';
import encodeImagePath from './utils/encode-image-path';

let timerId: NodeJS.Timeout | null = null;

type CameraProps = {
  detector: any;
  disabled?: boolean;
  Frame?: ({ detector }: { detector: any }) => JSX.Element;
  frameProcessor?: any;
  instructions: { description?: string; IconComponent: Icon; title: string };
  isObjectDetected?: boolean;
  size?: CameraSize;
  subtitle?: string;
  title: string;
  type?: CameraType;
  warning?: string;
};

const Camera = ({
  detector,
  disabled = false,
  Frame,
  frameProcessor,
  instructions,
  isObjectDetected,
  size = 'default',
  subtitle,
  title,
  type = 'back',
  warning,
}: CameraProps) => {
  const { t } = useTranslation('components.scan.camera');
  const { isLoading, isError, isSuccess, onSubmit, errors, onResetErrors } =
    useContext(ScanContext);
  const camera = useRef<VisionCamera>(null);
  const devices = useCameraDevices();
  const device = devices[type];
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const hasFeedback = isError || isSuccess;
  const showActionButtons = !hasFeedback && photo;
  const showTakePhotoManuallyButton = !hasFeedback && !showActionButtons;
  const showInstructions = !photo && !hasFeedback && !isError;
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

  const handleRetake = () => {
    setPhoto(null);
  };

  const handleRetakeAfterError = () => {
    handleRetake();
    onResetErrors();
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
                hasError={isError}
                resizeMode="cover"
                size={size}
                source={{ uri: photo.path }}
              />
            )}
            {showCamera && (
              <CameraContainer size={size}>
                {warning && <Warning>{warning}</Warning>}
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
            {isError && <Errors errors={errors} />}
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
        <Box gap={4}>
          {isSuccess && (
            <>
              <FeedbackButton>{t('cta-success')}</FeedbackButton>
              <Button disabled variant="secondary">
                {t('retake')}
              </Button>
            </>
          )}
          {isError && (
            <Button disabled={isLoading} onPress={handleRetakeAfterError}>
              {t('retake')}
            </Button>
          )}
          {showActionButtons && (
            <>
              <Button
                loading={isLoading}
                loadingLabel={t('cta-loading')}
                onPress={handleSubmit}
              >
                {t('cta')}
              </Button>
              <Button
                disabled={isLoading}
                onPress={handleRetake}
                variant="secondary"
              >
                {t('retake')}
              </Button>
            </>
          )}
        </Box>
        {showTakePhotoManuallyButton && (
          <FadeIn>
            <Button onPress={handleTakePhotoManually}>
              {t('take-manually')}
            </Button>
          </FadeIn>
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

const Preview = styled(Image)<{ size: CameraSize; hasError: boolean }>`
  ${({ theme, size, hasError }) => css`
    border-radius: ${theme.borderRadius.large};
    height: ${size === 'default' ? 260 : 390}px;
    margin-top: ${theme.spacing[7]};
    width: 100%;

    ${hasError &&
    css`
      border-width: ${theme.borderWidth[3]};
      border-color: ${theme.borderColor.error};
    `}
  `}
`;

export default Camera;
