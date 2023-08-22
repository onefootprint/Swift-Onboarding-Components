import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';

import { NavigationHeader } from '../../../../components';
import DesktopPhotoPrompt from '../../components/desktop-photo-prompt';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const DesktopFrontPhotoRetry = () => {
  const [state] = useIdDocMachine();
  const {
    idDoc: { type, country },
    errors,
  } = state.context;

  if (!type || !country) {
    return null;
  }

  return (
    <>
      <NavigationHeader />
      <DesktopPhotoPrompt
        imageType={IdDocImageTypes.front}
        type={type}
        country={country}
        isRetry
        errors={errors}
      />
    </>
  );
};

export default DesktopFrontPhotoRetry;
