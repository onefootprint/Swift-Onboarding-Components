import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import TakeOrUploadPhoto from '../../components/take-or-upload-photo';
import BadImageErrorLabel from '../../constants/bad-image-error-label';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';

const RetryIdDocBackPhoto = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('pages.retry-photo.back');
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
    <TakeOrUploadPhoto
      title={t('title', {
        type: IdDocTypeToLabel[type],
      })}
      subtitle={BadImageErrorLabel[backImageError]}
      onComplete={handleComplete}
    />
  );
};

export default RetryIdDocBackPhoto;
