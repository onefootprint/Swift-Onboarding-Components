import { IcoBolt24, Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Button,
  Container,
  FadeIn,
  Image,
  Typography,
} from '@onefootprint/ui';
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, ViewStyle } from 'react-native';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Camera as VisionCamera,
  PhotoFile,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';

import Instructions from '../instructions';
import type { CameraSize, CameraType } from './camera.types';
import processDocument from './frame-processors/process-document';
import useCanTakePhotoManually from './hooks/use-can-take-photo-manually';
import encodeImagePath from './utils/encode-image-path';

let timerId: NodeJS.Timeout | null = null;

type CameraProps = {
  disabled?: boolean;
  Frame?: ({ style }: { style: ViewStyle }) => JSX.Element;
  instructions: { description?: string; IconComponent: Icon; title: string };
  loading?: boolean;
  onSubmit: (encodedImage: string) => void;
  size?: CameraSize;
  subtitle?: string;
  title: string;
  type?: CameraType;
};

const Camera = ({
  disabled = false,
  Frame,
  instructions,
  loading,
  onSubmit,
  size = 'default',
  subtitle,
  title,
  type = 'back',
}: CameraProps) => {
  const { t } = useTranslation('components.scan.camera');
  const camera = useRef<VisionCamera>(null);
  const devices = useCameraDevices();
  const device = devices[type];
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const detector = useSharedValue(false);
  const frameStyles = useAnimatedStyle(
    () => ({
      borderWidth: withTiming(detector.value ? 6 : 2.5, { duration: 200 }),
    }),
    [detector],
  );
  const [canTakePhotoManually, resetCanTakePhotoManually] =
    useCanTakePhotoManually();
  const showActionButtons = photo;
  const showTakePhotoManuallyButton =
    !showActionButtons && canTakePhotoManually;
  const showInstructions = !photo;
  const showCamera = !photo && device;

  const handleDetectorChange = useCallback((value: boolean) => {
    resetAutoCapture();
    if (value) {
      timerId = setTimeout(takePhoto, 1000);
    }
  }, []);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const options = {
        frame: { x: 16, y: 30, width: windowWidth - 32, height: 220 },
      };
      const result = processDocument(frame, options);
      detector.value = result.is_document;
      if (detector.value !== result.is_document) {
        detector.value = !!result.is_document;
        runOnJS(handleDetectorChange)(result.is_document);
      }
    },
    [detector],
  );

  const takePhoto = async () => {
    resetCanTakePhotoManually();
    const newPhoto = await camera.current.takePhoto({
      flash: 'auto',
    });
    setPhoto(newPhoto);
  };

  const resetAutoCapture = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const handleTakePhotoManually = () => {
    resetAutoCapture();
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
                {Frame && <Frame style={frameStyles} />}
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
