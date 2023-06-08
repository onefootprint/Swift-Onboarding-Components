import { useTranslation } from '@onefootprint/hooks';
import React, { useState } from 'react';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import Camera from '../../components/camera';
import Preview from '../../components/preview';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useProcessImage from '../../hooks/use-process-image';

const MAX_VIDEO_HEIGHT = 390;
const FACE_OUTLINE_TO_HEIGHT_RATIO = 0.7;

const SelfiePhoto = () => {
  const { t } = useTranslation('pages.selfie-photo');
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
    send({
      type: 'receivedImage',
      payload: {
        image: imageString,
      },
    });
  };

  const handleError = () => {
    send({
      type: 'cameraErrored',
    });
  };

  const handleCapture = async (newImage: string) => {
    setImage(newImage);
  };

  return (
    <>
      <NavigationHeader />
      {image ? (
        <Preview
          imageSrc={image}
          onRetake={handleRetake}
          onConfirm={handleConfirm}
          isLoading={isLoading}
          title={t('title')}
        />
      ) : (
        <Camera
          onCapture={handleCapture}
          onError={handleError}
          cameraKind="front"
          title={t('title')}
          maxVideoHeight={MAX_VIDEO_HEIGHT}
          outlineWidthRatio={FACE_OUTLINE_TO_HEIGHT_RATIO}
          outlineHeightRatio={FACE_OUTLINE_TO_HEIGHT_RATIO}
          outlineKind="corner"
        />
      )}
    </>
  );
};

export default SelfiePhoto;
