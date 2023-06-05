import { IcoBolt24, Icon, IcoSmartphone224 } from '@onefootprint/icons';
import styled, { css, useTheme } from '@onefootprint/styled';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import { Dimensions, ViewStyle } from 'react-native';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Camera as VisionCamera,
  PhotoFile,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';

import Instructions from '../instructions';
import processDocument from './frame-processors/process-document';

let timerId: NodeJS.Timeout | null = null;

type CameraProps = {
  type: 'front' | 'back';
  title: string;
  subtitle?: string;
  instructions: {
    description?: string;
    IconComponent: Icon;
    title: string;
  };
  onSubmit: () => void;
  Frame?: ({ style }: { style: ViewStyle }) => JSX.Element;
};

const Camera = ({
  type,
  title,
  subtitle,
  instructions,
  onSubmit,
  Frame,
}: CameraProps) => {
  const theme = useTheme();
  const { t } = useTranslation('components.scan.camera');
  const camera = useRef<VisionCamera>(null);
  const devices = useCameraDevices();
  const device = devices[type];
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const detector = useSharedValue(false);
  const frameStyles = useAnimatedStyle(
    () => ({
      borderColor: detector.value
        ? theme.color.success
        : theme.borderColor.primary,
    }),
    [detector],
  );
  const showButtons = photo;
  const showInstructions = !photo;
  const showCamera = !photo && device;

  const handleDetectorChange = (value: boolean) => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (value) {
      timerId = setTimeout(handleTakePhoto, 1000);
    }
  };

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const options = {
        frame: { x: 16, y: 30, width: windowWidth - 32, height: 220 },
      };
      const result = processDocument(frame, options);
      detector.value = result.is_document;
      if (detector.value !== result.is_document) {
        detector.value = result.is_document;
        runOnJS(handleDetectorChange)(result.is_document);
      }
    },
    [detector],
  );

  const handleSubmit = () => {
    // TODO: Submit photo
    onSubmit();
  };

  const handleReset = () => {
    setPhoto(null);
  };

  const handleTakePhoto = async () => {
    const newPhoto = await camera.current.takePhoto({
      flash: 'auto',
    });
    setPhoto(newPhoto);
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
            <CameraContainer>
              {photo && <Preview source={{ uri: photo.path }} />}
              {showCamera && (
                <>
                  {Frame && <Frame style={frameStyles} />}
                  <StyledCamera
                    device={device}
                    frameProcessor={frameProcessor}
                    isActive
                    photo
                    ref={camera}
                  />
                </>
              )}
            </CameraContainer>
          </Box>
          {showInstructions && (
            <Instructions
              options={[
                {
                  icon: instructions.IconComponent,
                  title: instructions.title,
                  description: instructions.description,
                },
                {
                  icon: IcoSmartphone224,
                  title: t('instructions.steady'),
                },
                { icon: IcoBolt24, title: t('instructions.capture') },
              ]}
            />
          )}
        </Box>
        {showButtons && (
          <Box gap={4}>
            <Button variant="secondary" onPress={handleSubmit}>
              {t('continue')}
            </Button>
            <Button variant="secondary" onPress={handleReset}>
              {t('retake')}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

const windowWidth = Dimensions.get('window').width;

const CameraContainer = styled.View`
  ${({ theme }) => css`
    align-items: center;
    height: 280px;
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

const Preview = styled.Image`
  height: 100%;
  width: 100%;
`;

export default Camera;
