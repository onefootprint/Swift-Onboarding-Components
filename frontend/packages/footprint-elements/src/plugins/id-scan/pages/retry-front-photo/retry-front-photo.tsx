import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { useIdScanMachine } from '../../components/machine-provider';
import TakeOrUploadPhoto from '../../components/take-or-upload-photo';
import BadImageErrorLabel from '../../constants/bad-image-error-label';
import IdScanDocTypeToLabel from '../../constants/doc-type-labels';
import { Events } from '../../utils/state-machine/types';

const RetryFrontPhoto = () => {
  const [state, send] = useIdScanMachine();
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
        type: IdScanDocTypeToLabel[type],
      })}
      subtitle={BadImageErrorLabel[frontImageError]}
      onComplete={handleComplete}
    />
  );
};

export default RetryFrontPhoto;
