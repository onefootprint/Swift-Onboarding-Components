import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const MAX_VIDEO_HEIGHT = 390;
const FACE_OUTLINE_TO_HEIGHT_RATIO = 0.7;

const SelfiePhoto = () => {
  const { t } = useTranslation('pages.selfie-photo');
  const [, send] = useIdDocMachine();

  const onComplete = (imageString: string) =>
    send({
      type: 'receivedImage',
      payload: {
        image: imageString,
      },
    });

  return (
    <>
      <NavigationHeader />
      <PhotoCapture
        maxVideoHeight={MAX_VIDEO_HEIGHT}
        outlineHeightRatio={FACE_OUTLINE_TO_HEIGHT_RATIO}
        outlineWidthRatio={FACE_OUTLINE_TO_HEIGHT_RATIO}
        cameraKind="front"
        outlineKind="corner"
        title={t('title')}
        onComplete={onComplete}
      />
    </>
  );
};

export default SelfiePhoto;
