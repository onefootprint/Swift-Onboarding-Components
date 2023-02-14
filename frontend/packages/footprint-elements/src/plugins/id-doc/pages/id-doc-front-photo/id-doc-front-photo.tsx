import { IcoIdFront40 } from '@onefootprint/icons';
import React from 'react';

import { NavigationHeader } from '../../../../components';
import IdDocPhotoPrompt from '../../components/id-doc-photo-prompt';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';

const IdDocFrontPhoto = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type },
  } = state.context;

  if (!type) {
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
    <>
      <NavigationHeader />
      <IdDocPhotoPrompt
        iconComponent={IcoIdFront40}
        showGuidelines
        side="front"
        type={type}
        onComplete={handleComplete}
      />
    </>
  );
};

export default IdDocFrontPhoto;
