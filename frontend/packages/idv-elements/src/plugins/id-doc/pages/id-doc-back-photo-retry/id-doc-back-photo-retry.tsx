import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';

import IdDocPhotoRetryPrompt from '../../components/id-doc-photo-retry-prompt';
import { useIdDocMachine } from '../../components/machine-provider';
import { getCountryFromCode } from '../../utils/get-country-from-code';

const IdDocBackPhotoRetry = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type, country },
  } = state.context;

  if (!type || !country) {
    return null;
  }

  const countryName = getCountryFromCode(country)?.label;

  const handleComplete = (imageString: string, mimeType: string) => {
    send({
      type: 'receivedImage',
      payload: {
        imageString,
        mimeType,
      },
    });
  };

  return (
    <IdDocPhotoRetryPrompt
      docType={type}
      countryName={countryName ?? country}
      imageType={IdDocImageTypes.back}
      onComplete={handleComplete}
      errors={state.context.errors || []}
    />
  );
};

export default IdDocBackPhotoRetry;
