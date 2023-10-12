import { Logger } from '@onefootprint/dev-tools';
import { Box } from '@onefootprint/ui';
import React, { useLayoutEffect, useState } from 'react';

import {
  HeaderTitle,
  NavigationHeader,
  useLayoutOptions,
} from '../../../../components';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useProcessImage from '../../hooks/use-process-image';
import type { CaptureKind } from '../../utils/state-machine';
import Camera from '../camera';
import type { DeviceKind } from '../camera/camera';
import type { OutlineKind } from '../camera/components/overlay/overlay';
import type { AutocaptureKind } from '../camera/hooks/use-auto-capture';
import type { CameraKind } from '../camera/utils/get-camera-options';
import Preview from '../preview';

type HeaderTextType = {
  camera: string;
  preview: string;
};

type PhotoCaptureProps = {
  outlineWidthRatio: number; // with respect to the video width
  outlineHeightRatio: number; // with respect to the video width (not height)
  cameraKind: CameraKind;
  outlineKind: OutlineKind;
  onComplete: (
    imageFile: File,
    extraCompressed: boolean,
    captureKind?: CaptureKind,
  ) => void;
  autocaptureKind: AutocaptureKind;
  deviceKind: DeviceKind;
  onBack?: () => void;
  title: HeaderTextType;
  subtitle?: Partial<HeaderTextType>;
};

const PhotoCapture = ({
  outlineKind,
  outlineWidthRatio,
  outlineHeightRatio,
  cameraKind,
  onComplete,
  autocaptureKind,
  deviceKind,
  onBack,
  title,
  subtitle,
}: PhotoCaptureProps) => {
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity } = state.context;
  const [image, setImage] = useState<string | null>(null);
  const { processImageUrl } = useProcessImage();
  const [isLoading, setIsLoading] = useState(false);
  const [captureKind, setCaptureKind] = useState<CaptureKind>();
  const {
    footer: { set: updateFooter },
  } = useLayoutOptions();

  useLayoutEffect(() => {
    if (deviceKind !== 'mobile') {
      return () => {};
    }
    // Only hide footer when we are in camera mode
    if (image) {
      updateFooter({ visible: true });
    } else {
      updateFooter({ visible: false });
    }

    return () => {
      // Reset footer visibility when unmounting just in case
      updateFooter({ visible: true });
    };
  }, [image, deviceKind, updateFooter]);

  const handleRetake = () => {
    setImage(null);
  };

  const handleConfirm = async () => {
    if (!image) {
      console.warn(
        'Captured image could not be confirmed and submitted - retaking the image',
      );
      Logger.warn(
        'Captured image could not be confirmed and submitted - retaking the image',
        'photo-capture',
      );
      return;
    }

    setIsLoading(true);
    const processResult = await processImageUrl(image, hasBadConnectivity);
    if (!processResult) {
      // An error occurred, directly prompt user to re-take the image
      setIsLoading(false);
      handleRetake();
      console.warn(
        'Captured image could not be processed - retaking the image',
      );
      Logger.warn(
        'Captured image could not be processed - retaking the image',
        'photo-capture',
      );
      return;
    }

    setIsLoading(false);
    const { file, extraCompressed } = processResult;
    onComplete(file, extraCompressed, captureKind);
  };

  const handleError = () => {
    send({
      type: 'cameraErrored',
    });
  };

  const handleCapture = (newImage: string, newCaptureKind: CaptureKind) => {
    setImage(newImage);
    setCaptureKind(newCaptureKind);
  };

  return image ? (
    <>
      {deviceKind === 'desktop' && (
        <Box marginBottom={7}>
          <NavigationHeader
            leftButton={{ variant: 'close', confirmClose: true }}
          />
          <HeaderTitle title={title.preview} />
        </Box>
      )}
      {deviceKind === 'mobile' && (
        <Box marginBottom={7}>
          <NavigationHeader leftButton={{ variant: 'back', onBack }} />
          <HeaderTitle title={title.preview} subtitle={subtitle?.preview} />
        </Box>
      )}
      <Preview
        imageSrc={image}
        onRetake={handleRetake}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        cameraKind={cameraKind}
        deviceKind={deviceKind}
      />
    </>
  ) : (
    <>
      {deviceKind === 'desktop' && (
        <Box marginBottom={7}>
          <NavigationHeader
            leftButton={{ variant: 'close', confirmClose: true }}
          />
          <HeaderTitle title={title.camera} subtitle={subtitle?.camera} />
        </Box>
      )}
      {deviceKind === 'mobile' && (
        <NavigationHeader
          leftButton={{ variant: 'back', onBack, color: 'quinary' }}
          content={{
            kind: 'static',
            title: title.camera,
          }}
          style={{
            fontColor: 'quinary',
            backgroundVariant: 'dark-glass',
          }}
          position="floating"
        />
      )}
      <Camera
        onCapture={handleCapture}
        onError={deviceKind === 'mobile' ? handleError : undefined} // We just show a toast in desktop since we don't have a prompt page
        cameraKind={cameraKind}
        outlineWidthRatio={outlineWidthRatio}
        outlineHeightRatio={outlineHeightRatio}
        outlineKind={outlineKind}
        autocaptureKind={autocaptureKind}
        deviceKind={deviceKind}
      />
    </>
  );
};

export default PhotoCapture;
