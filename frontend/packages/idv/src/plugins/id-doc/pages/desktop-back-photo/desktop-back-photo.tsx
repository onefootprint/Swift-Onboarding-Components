import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';

import { NavigationHeader } from '../../../../components';
import DesktopPhotoPrompt from '../../components/desktop-photo-prompt';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const DesktopBackPhoto = () => {
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
        imageType={IdDocImageTypes.back}
        type={type}
        country={country}
      />
    </>
  );
};

export default DesktopBackPhoto;
