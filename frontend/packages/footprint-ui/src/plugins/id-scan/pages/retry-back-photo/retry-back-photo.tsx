import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { useIdScanMachine } from '../../components/machine-provider';
import TakeOrUploadPhoto from '../../components/take-or-upload-photo';
import BadImageErrorLabel from '../../constants/bad-image-error-label';
import IdScanDocTypeToLabel from '../../constants/doc-type-labels';
import { Events } from '../../utils/state-machine/types';

const RetryBackPhoto = () => {
  const [state, send] = useIdScanMachine();
  const { t } = useTranslation('pages.retry-photo.back');
  const { backImageError, type } = state.context;
  if (!backImageError || !type) {
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
    <TakeOrUploadPhoto
      title={t('title', {
        type: IdScanDocTypeToLabel[type],
      })}
      subtitle={BadImageErrorLabel[backImageError]}
      onComplete={handleComplete}
    />
  );
};

export default RetryBackPhoto;
