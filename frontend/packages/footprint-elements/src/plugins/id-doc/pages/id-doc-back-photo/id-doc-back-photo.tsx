import { IcoIdBack40 } from '@onefootprint/icons';
import React from 'react';

import { NavigationHeader } from '../../../../components';
import IdDocPhotoPrompt from '../../components/id-doc-photo-prompt';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';

const IdDocBackPhoto = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type },
  } = state.context;

  if (!type) {
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
    <>
      <NavigationHeader />
      <IdDocPhotoPrompt
        iconComponent={IcoIdBack40}
        showGuidelines
        side="back"
        type={type}
        onComplete={handleComplete}
      />
    </>
  );
};

export default IdDocBackPhoto;
