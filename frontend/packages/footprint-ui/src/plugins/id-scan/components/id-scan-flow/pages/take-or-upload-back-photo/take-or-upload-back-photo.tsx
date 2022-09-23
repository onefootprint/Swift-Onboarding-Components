import React from 'react';

import { Events } from '../../../../utils/state-machine/types';
import { useIdScanMachine } from '../../../machine-provider';
import TakeOrUploadPhoto from '../../../take-or-upload-photo';

const TakeOrUploadBackPhoto = () => {
  const [state, send] = useIdScanMachine();
  const { type } = state.context;
  if (!type) {
    return null;
  }

  const handleComplete = (image: string) => {
    send({
      type: Events.receivedBackImage,
      payload: {
        image,
      },
    });
  };

  return (
    <TakeOrUploadPhoto side="back" type={type} onComplete={handleComplete} />
  );
};

export default TakeOrUploadBackPhoto;
