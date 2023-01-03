import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import TakeOrUploadPhoto from '../../components/take-or-upload-photo';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';

const IdDocBackPhoto = () => {
  const { t } = useTranslation('pages.id-doc-photo.back');
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type },
  } = state.context;

  if (!type) {
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
      subtitle={t('subtitle', {
        type: IdDocTypeToLabel[type],
      })}
      showGuidelines
      onComplete={handleComplete}
    />
  );
};

export default IdDocBackPhoto;
