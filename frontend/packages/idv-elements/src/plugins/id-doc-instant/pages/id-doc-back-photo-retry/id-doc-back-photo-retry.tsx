import React from 'react';

import IdDocPhotoRetryPrompt from '../../components/id-doc-photo-retry-prompt';
import { useIdDocMachine } from '../../components/machine-provider';
import { ImageTypes } from '../../constants/image-types';
import { getCountryFromCode3 } from '../../utils/get-country-from-code';

const IdDocBackPhotoRetry = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type, country },
  } = state.context;

  if (!type || !country) {
    return null;
  }

  const countryName = getCountryFromCode3(country)?.label;

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
      docType={type}
      countryName={countryName ?? country}
      imageType={ImageTypes.back}
      onComplete={handleComplete}
      errors={state.context.errors || []}
    />
  );
};

export default IdDocBackPhotoRetry;
