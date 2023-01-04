import { IcoIdFront40 } from '@onefootprint/icons';
import React from 'react';

import IdDocPhotoPrompt from '../../components/id-doc-photo-prompt';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';

const RetryIdDocFrontPhoto = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { frontImageError, type },
  } = state.context;
  if (!frontImageError || !type) {
    return null;
  }

  const handleComplete = (image: string) => {
    send({
      type: Events.receivedIdDocFrontImage,
      payload: {
        image,
      },
    });
  };

  return (
    <IdDocPhotoPrompt
      iconComponent={IcoIdFront40}
      side="front"
      type={type}
      error={frontImageError}
      onComplete={handleComplete}
    />
  );
};

export default RetryIdDocFrontPhoto;
