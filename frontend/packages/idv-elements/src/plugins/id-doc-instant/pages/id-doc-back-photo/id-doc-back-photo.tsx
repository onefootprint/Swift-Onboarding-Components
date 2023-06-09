import React from 'react';

import { NavigationHeader } from '../../../../components';
import IdDocPhotoPrompt from '../../components/id-doc-photo-prompt';
import { ImageTypes } from '../../constants/image-types';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const IdDocBackPhoto = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type, country },
  } = state.context;

  if (!type || !country) {
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
        country={country}
      />
    </>
  );
};

export default IdDocBackPhoto;
