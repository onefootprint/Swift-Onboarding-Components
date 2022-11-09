import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { useIdDocMachine } from '../../components/machine-provider';
import TakeOrUploadPhoto from '../../components/take-or-upload-photo';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import { Events } from '../../utils/state-machine/types';

const TakeOrUploadFrontPhoto = () => {
  const { t } = useTranslation('pages.take-or-upload-photo.front');
  const [state, send] = useIdDocMachine();
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
    <TakeOrUploadPhoto
      title={t('title', {
        type: IdDocTypeToLabel[type],
      })}
      subtitle={t('subtitle', {
        type: IdDocTypeToLabel[type],
      })}
      showGuidelines
      onComplete={handleComplete}
    />
  );
};

export default TakeOrUploadFrontPhoto;
