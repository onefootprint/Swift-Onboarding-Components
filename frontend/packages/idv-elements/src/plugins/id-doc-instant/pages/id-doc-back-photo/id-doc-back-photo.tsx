import React from 'react';

import { NavigationHeader } from '../../../../components';
import IdDocPhotoPrompt from '../../components/id-doc-photo-prompt';
import { ImageTypes } from '../../constants/image-types';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const IdDocBackPhoto = () => {
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

  const handleClickBack = () => {
    send({
      type: 'navigatedToPrev',
    });
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'back', onBack: handleClickBack }} />
      <IdDocPhotoPrompt
        showGuidelines
        imageType={ImageTypes.back}
        type={type}
        onComplete={handleComplete}
      />
    </>
  );
};

export default IdDocBackPhoto;
