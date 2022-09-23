import React from 'react';

import { Events } from '../../../../utils/state-machine/types';
import { useIdScanMachine } from '../../../machine-provider';
import TakeOrUploadPhoto from '../../../take-or-upload-photo';

const TakeOrUploadFrontPhoto = () => {
  const [state, send] = useIdScanMachine();
  const { type } = state.context;
  if (!type) {
    return null;
  }

  const handleComplete = (image: string) => {
    send({
      type: Events.receivedFrontImage,
      payload: {
        image,
      },
    });
  };

  return (
    <TakeOrUploadPhoto side="front" type={type} onComplete={handleComplete} />
  );
};

export default TakeOrUploadFrontPhoto;
