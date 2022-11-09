import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import TakeOrUploadPhoto from '../../components/take-or-upload-photo';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import useIdDocMachine, {
  Events,
  MachineContext,
} from '../../hooks/use-id-doc-machine';

const TakeOrUploadBackPhoto = () => {
  const { t } = useTranslation('pages.take-or-upload-photo.back');
  const [state, send] = useIdDocMachine();
  const { type }: MachineContext = state.context;

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

export default TakeOrUploadBackPhoto;
