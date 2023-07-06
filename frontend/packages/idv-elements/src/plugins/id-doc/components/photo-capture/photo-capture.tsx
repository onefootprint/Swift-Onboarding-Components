import React, { useState } from 'react';

import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useProcessImage from '../../hooks/use-process-image';
import Camera from '../camera';
import { CameraKind } from '../camera/camera';
import { OutlineKind } from '../camera/components/overlay/overlay';
import { AutocaptureKind } from '../camera/hooks/use-auto-capture';
import Preview from '../preview';

type PhotoCaptureProps = {
  outlineWidthRatio: number; // with respect to the video width
  outlineHeightRatio: number; // with respect to the video width (not height)
  cameraKind: CameraKind;
  outlineKind: OutlineKind;
  onComplete: (imageString: string) => void;
  autocaptureKind: AutocaptureKind;
};

const PhotoCapture = ({
  outlineKind,
  outlineWidthRatio,
  outlineHeightRatio,
  cameraKind,
  onComplete,
  autocaptureKind,
}: PhotoCaptureProps) => {
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
    const processedImageFile = await processImageUrl(image);
    if (!processedImageFile) {
      // An error occurred, directly prompt user to re-take the image
      setIsLoading(false);
      handleRetake();
      return;
    }

    const imageString = await convertImageFileToStrippedBase64(
      processedImageFile,
    );
    if (!imageString) {
      setIsLoading(false);
      handleRetake();
      return;
    }

    setIsLoading(false);
    onComplete(imageString);
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
    <Preview
      imageSrc={image}
      onRetake={handleRetake}
      onConfirm={handleConfirm}
      isLoading={isLoading}
      cameraKind={cameraKind}
    />
  ) : (
    <Camera
      onCapture={handleCapture}
      onError={handleError}
      cameraKind={cameraKind}
      outlineWidthRatio={outlineWidthRatio}
      outlineHeightRatio={outlineHeightRatio}
      outlineKind={outlineKind}
      autocaptureKind={autocaptureKind}
    />
  );
};

export default PhotoCapture;
