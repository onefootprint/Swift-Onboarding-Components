import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import IdScanDocTypeToLabel from '../../../../constants/doc-type-labels';
import { Events } from '../../../../utils/state-machine/types';
import { useIdScanMachine } from '../../../machine-provider';
import TakeOrUploadPhoto from '../../../take-or-upload-photo';

const TakeOrUploadFrontPhoto = () => {
  const { t } = useTranslation('pages.take-or-upload-photo.front');
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

export default TakeOrUploadFrontPhoto;
