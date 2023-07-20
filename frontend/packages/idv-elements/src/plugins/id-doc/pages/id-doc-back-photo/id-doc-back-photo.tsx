import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';

import { NavigationHeader } from '../../../../components';
import IdDocPhotoPrompt from '../../components/id-doc-photo-prompt';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import { getCountryFromCode } from '../../utils/get-country-from-code';

const IdDocBackPhoto = () => {
  const [state] = useIdDocMachine();
  const {
    idDoc: { type, country },
  } = state.context;

  const countryCode3 = getCountryFromCode(country)?.value3;

  if (!type || !countryCode3) {
    return null;
  }

  return (
    <>
      <NavigationHeader />
      <IdDocPhotoPrompt
        showGuidelines
        imageType={IdDocImageTypes.back}
        type={type}
        country={countryCode3}
      />
    </>
  );
};

export default IdDocBackPhoto;
