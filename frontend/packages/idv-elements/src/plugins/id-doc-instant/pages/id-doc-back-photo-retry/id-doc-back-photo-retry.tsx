import React from 'react';

import IdDocPhotoRetryPrompt from '../../components/id-doc-photo-retry-prompt';
import { useIdDocMachine } from '../../components/machine-provider';
import { ImageTypes } from '../../constants/image-types';

const IdDocBackPhotoRetry = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type },
  } = state.context;

  if (!type) {
    return null;
  }

  const handleComplete = (image: string) => {
    send({
      type: 'receivedImage',
      payload: {
        image,
      },
    });
  };

  return (
    <IdDocPhotoRetryPrompt
      imageType={ImageTypes.back}
      onComplete={handleComplete}
      errors={state.context.errors || []}
    />
  );
};

export default IdDocBackPhotoRetry;
