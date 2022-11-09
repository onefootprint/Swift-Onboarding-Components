import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { useIdDocMachine } from '../../components/machine-provider';
import TakeOrUploadPhoto from '../../components/take-or-upload-photo';
import BadImageErrorLabel from '../../constants/bad-image-error-label';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import { Events } from '../../utils/state-machine/types';

const RetryFrontPhoto = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('pages.retry-photo.front');
  const { frontImageError, type } = state.context;
  if (!frontImageError || !type) {
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
      subtitle={BadImageErrorLabel[frontImageError]}
      onComplete={handleComplete}
    />
  );
};

export default RetryFrontPhoto;
