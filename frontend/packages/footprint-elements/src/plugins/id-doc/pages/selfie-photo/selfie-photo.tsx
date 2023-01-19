import React, { useState } from 'react';

import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';
import stripBase64Prefix from '../../utils/image-processing/strip-base64-prefix';
import Camera from './components/camera';
import Preview from './components/preview';

const SelfiePhoto = () => {
  const [, send] = useIdDocMachine();
  const [image, setImage] = useState<string | null>(null);

  const handleRetake = () => {
    setImage(null);
  };

  const handleConfirm = () => {
    if (!image) {
      return;
    }
    send({
      type: Events.receivedSelfieImage,
      payload: {
        image: stripBase64Prefix(image),
      },
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
    />
  ) : (
    <Camera onCapture={handleCapture} />
  );
};

export default SelfiePhoto;
