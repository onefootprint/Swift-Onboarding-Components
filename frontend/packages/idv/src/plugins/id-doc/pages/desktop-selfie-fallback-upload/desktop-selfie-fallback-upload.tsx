import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';

import { NavigationHeader } from '../../../../components';
import DesktopPhotoPrompt from '../../components/desktop-photo-prompt';
import { useIdDocMachine } from '../../components/machine-provider';

const DesktopSelfieFallbackUpload = () => {
  const [state] = useIdDocMachine();
  const {
    idDoc: { type, country },
  } = state.context;

  if (!type || !country) {
    return null;
  }

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <DesktopPhotoPrompt
        imageType={IdDocImageTypes.selfie}
        type={type}
        country={country}
        showCameraFallbackText
      />
    </>
  );
};

export default DesktopSelfieFallbackUpload;
