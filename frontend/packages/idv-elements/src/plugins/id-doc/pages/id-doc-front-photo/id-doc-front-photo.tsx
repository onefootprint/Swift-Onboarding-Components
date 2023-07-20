import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';

import { NavigationHeader } from '../../../../components';
import IdDocPhotoPrompt from '../../components/id-doc-photo-prompt';
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
        imageType={IdDocImageTypes.front}
        type={type}
        country={countryCode3}
      />
    </>
  );
};

export default IdDocFrontPhoto;
