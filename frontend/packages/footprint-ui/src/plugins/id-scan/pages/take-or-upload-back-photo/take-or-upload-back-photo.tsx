import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { useIdScanMachine } from '../../components/machine-provider';
import TakeOrUploadPhoto from '../../components/take-or-upload-photo';
import IdScanDocTypeToLabel from '../../constants/doc-type-labels';
import { Events } from '../../utils/state-machine/types';

const TakeOrUploadBackPhoto = () => {
  const { t } = useTranslation('pages.take-or-upload-photo.back');
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
    <TakeOrUploadPhoto
      title={t('title', {
        type: IdScanDocTypeToLabel[type],
      })}
      subtitle={t('subtitle', {
        type: IdScanDocTypeToLabel[type],
      })}
      showGuidelines
      onComplete={handleComplete}
    />
  );
};

export default TakeOrUploadBackPhoto;
