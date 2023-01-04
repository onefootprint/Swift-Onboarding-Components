import { IcoIdBack40 } from '@onefootprint/icons';
import React from 'react';

import IdDocPhotoPrompt from '../../components/id-doc-photo-prompt';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';

const RetryIdDocBackPhoto = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { backImageError, type },
  } = state.context;
  if (!backImageError || !type) {
    return null;
  }

  const handleComplete = (image: string) => {
    send({
      type: Events.receivedIdDocBackImage,
      payload: {
        image,
      },
    });
  };

  return (
    <IdDocPhotoPrompt
      iconComponent={IcoIdBack40}
      side="back"
      type={type}
      error={backImageError}
      onComplete={handleComplete}
    />
  );
};

export default RetryIdDocBackPhoto;
