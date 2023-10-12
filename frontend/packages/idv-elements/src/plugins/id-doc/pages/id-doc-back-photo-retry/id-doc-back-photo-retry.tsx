import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';

import IdDocPhotoRetryPrompt from '../../components/id-doc-photo-retry-prompt';
import { useIdDocMachine } from '../../components/machine-provider';
import { getCountryFromCode } from '../../utils/get-country-from-code';

const IdDocBackPhotoRetry = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type, country },
    errors,
  } = state.context;

  if (!type || !country) {
    return null;
  }

  const countryName = getCountryFromCode(country)?.label;

  const handleComplete = (imageFile: File, extraCompressed: boolean) => {
    send({
      type: 'receivedImage',
      payload: {
        imageFile,
        extraCompressed,
      },
    });
  };

  return (
    <IdDocPhotoRetryPrompt
      docType={type}
      countryName={countryName ?? country}
      imageType={IdDocImageTypes.back}
      onComplete={handleComplete}
      errors={errors || []}
    />
  );
};

export default IdDocBackPhotoRetry;
