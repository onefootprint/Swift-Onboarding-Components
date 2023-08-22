import { useTranslation } from '@onefootprint/hooks';
import { Box } from '@onefootprint/ui';
import React, { useState } from 'react';

import { HeaderTitle, NavigationHeader } from '../../../../components';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useProcessImage from '../../hooks/use-process-image';
import Camera from '../camera';
import { DeviceKind } from '../camera/camera';
import { OutlineKind } from '../camera/components/overlay/overlay';
import { AutocaptureKind } from '../camera/hooks/use-auto-capture';
import { CameraKind } from '../camera/utils/get-camera-options';
import Preview from '../preview';

type PhotoCaptureProps = {
  outlineWidthRatio: number; // with respect to the video width
  outlineHeightRatio: number; // with respect to the video width (not height)
  cameraKind: CameraKind;
  outlineKind: OutlineKind;
  onComplete: (imageString: string, mimeType: string) => void;
  autocaptureKind: AutocaptureKind;
  deviceKind: DeviceKind;
};

const PhotoCapture = ({
  outlineKind,
  outlineWidthRatio,
  outlineHeightRatio,
  cameraKind,
  onComplete,
  autocaptureKind,
  deviceKind,
}: PhotoCaptureProps) => {
  const { t } = useTranslation('components.photo-capture');
  const [, send] = useIdDocMachine();
  const [image, setImage] = useState<string | null>(null);
  const { processImageUrl, convertImageFileToStrippedBase64 } =
    useProcessImage();
  const [isLoading, setIsLoading] = useState(false);

  const handleRetake = () => {
    setImage(null);
  };

  const handleConfirm = async () => {
    if (!image) {
      return;
    }

    setIsLoading(true);
    const processingResult = await processImageUrl(image);
    if (!processingResult) {
      // An error occurred, directly prompt user to re-take the image
      setIsLoading(false);
      handleRetake();
      return;
    }

    const { processedImageFile, mimeType } = processingResult;

    const imageString = await convertImageFileToStrippedBase64(
      processedImageFile,
    );
    if (!imageString) {
      setIsLoading(false);
      handleRetake();
      return;
    }

    setIsLoading(false);
    onComplete(imageString, mimeType);
  };

  const handleError = () => {
    send({
      type: 'cameraErrored',
    });
  };

  const handleCapture = async (newImage: string) => {
    setImage(newImage);
  };

  return image ? (
    <>
      {deviceKind === 'desktop' && (
        <Box sx={{ marginBottom: 7 }}>
          <NavigationHeader />
          <HeaderTitle title={t('desktop-selfie.header.preview.title')} />
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
        <Box sx={{ marginBottom: 7 }}>
          <NavigationHeader />
          <HeaderTitle
            title={t('desktop-selfie.header.camera.title')}
            subtitle={t('desktop-selfie.header.camera.subtitle')}
          />
        </Box>
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
