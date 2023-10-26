import { IcoInfo24 } from '@onefootprint/icons';
import type { IdDocImageTypes } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React, { useEffect, useLayoutEffect, useState } from 'react';

import {
  HeaderTitle,
  NavigationHeader,
  useLayoutOptions,
} from '../../../../components';
import Logger from '../../../../utils/logger';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useProcessImage from '../../hooks/use-process-image';
import type { CaptureKind } from '../../utils/state-machine';
import Camera from '../camera';
import type { DeviceKind } from '../camera/camera';
import type { AutocaptureKind } from '../camera/hooks/use-auto-capture';
import type { CameraKind } from '../camera/utils/get-camera-options';
import Loading from '../loading';
import Preview from '../preview';
import Instructions from './components/instructions';

type HeaderTextType = {
  camera: string;
  preview: string;
};

type PhotoCaptureProps = {
  outlineWidthRatio: number; // with respect to the video width
  outlineHeightRatio: number; // with respect to the video width (not height)
  cameraKind: CameraKind;
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
  imageType: IdDocImageTypes;
};

const PhotoCapture = ({
  outlineWidthRatio,
  outlineHeightRatio,
  cameraKind,
  onComplete,
  autocaptureKind,
  deviceKind,
  onBack,
  title,
  subtitle,
  imageType,
}: PhotoCaptureProps) => {
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity } = state.context;
  const [image, setImage] = useState<string | null>(null);
  const { processImageUrl } = useProcessImage();
  const [isLoading, setIsLoading] = useState(false);
  const [captureKind, setCaptureKind] = useState<CaptureKind>();
  const [showInstructions, setShowInstructions] = useState(false);
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

  useEffect(() => {
    if (image && deviceKind === 'mobile') handleConfirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const handleCapture = (newImage: string, newCaptureKind: CaptureKind) => {
    setImage(newImage);
    setCaptureKind(newCaptureKind);
  };

  return image ? (
    <>
      {deviceKind === 'desktop' && (
        <>
          <Box marginBottom={7}>
            <NavigationHeader
              leftButton={{ variant: 'close', confirmClose: true }}
            />
            <HeaderTitle title={title.preview} />
          </Box>
          <Preview
            imageSrc={image}
            onRetake={handleRetake}
            onConfirm={handleConfirm}
            isLoading={isLoading}
            cameraKind={cameraKind}
            deviceKind={deviceKind}
          />
        </>
      )}
      {deviceKind === 'mobile' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Loading step="process" imageType={imageType} />
        </Box>
      )}
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
          leftButton={{ variant: 'back', onBack }}
          rightButton={{
            icon: IcoInfo24,
            onClick: () => setShowInstructions(true),
          }}
          content={{
            kind: 'static',
            title: title.camera,
          }}
        />
      )}
      <Camera
        onCapture={handleCapture}
        onError={deviceKind === 'mobile' ? handleError : undefined} // We just show a toast in desktop since we don't have a prompt page
        cameraKind={cameraKind}
        outlineWidthRatio={outlineWidthRatio}
        outlineHeightRatio={outlineHeightRatio}
        autocaptureKind={autocaptureKind}
        deviceKind={deviceKind}
      />
      <Instructions
        onClose={() => setShowInstructions(false)}
        isOpen={showInstructions}
        autocaptureKind={autocaptureKind}
      />
    </>
  );
};

export default PhotoCapture;
