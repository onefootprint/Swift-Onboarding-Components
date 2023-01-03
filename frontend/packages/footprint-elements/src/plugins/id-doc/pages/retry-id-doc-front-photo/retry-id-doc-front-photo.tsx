import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import TakeOrUploadPhoto from '../../components/take-or-upload-photo';
import BadImageErrorLabel from '../../constants/bad-image-error-label';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';

const RetryIdDocFrontPhoto = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('pages.retry-photo.front');
  const {
    idDoc: { frontImageError, type },
  } = state.context;
  if (!frontImageError || !type) {
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
    <TakeOrUploadPhoto
      title={t('title', {
        type: IdDocTypeToLabel[type],
      })}
      subtitle={BadImageErrorLabel[frontImageError]}
      onComplete={handleComplete}
    />
  );
};

export default RetryIdDocFrontPhoto;
