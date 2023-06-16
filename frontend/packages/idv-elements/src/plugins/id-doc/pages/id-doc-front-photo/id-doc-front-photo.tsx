import React from 'react';

import { NavigationHeader } from '../../../../components';
import IdDocPhotoPrompt from '../../components/id-doc-photo-prompt';
import { ImageTypes } from '../../constants/image-types';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import { getCountryFromCode } from '../../utils/get-country-from-code';

const IdDocFrontPhoto = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type, country },
  } = state.context;

  const countryCode3 = getCountryFromCode(country)?.value3;

  if (!type || !countryCode3) {
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
        imageType={ImageTypes.front}
        type={type}
        onComplete={handleComplete}
        country={countryCode3}
      />
    </>
  );
};

export default IdDocFrontPhoto;
