import React, { useState } from 'react';

import { NavigationHeader } from '../../../../components';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';
import useProcessImage from '../../hooks/use-process-image/use-process-image';
import Camera from './components/camera';
import Preview from './components/preview';

const SelfiePhoto = () => {
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
      type: Events.receivedSelfieImage,
      payload: {
        image: imageString,
      },
    });
  };

  const handleError = () => {
    send({
      type: Events.cameraErrored,
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
        />
      ) : (
        <Camera onCapture={handleCapture} onError={handleError} />
      )}
    </>
  );
};

export default SelfiePhoto;
