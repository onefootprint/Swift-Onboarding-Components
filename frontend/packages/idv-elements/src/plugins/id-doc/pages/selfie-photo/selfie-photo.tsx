import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const FACE_OUTLINE_TO_WIDTH_RATIO = 0.6;

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

  const handleClickBack = () => {
    send({
      type: 'navigatedToPrev',
    });
  };

  return (
    <>
      <NavigationHeader
        button={{ variant: 'back', onBack: handleClickBack }}
        content={{
          kind: 'static',
          title: t('title'),
        }}
      />
      <PhotoCapture
        outlineHeightRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
        outlineWidthRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
        cameraKind="front"
        outlineKind="corner"
        onComplete={onComplete}
        autocaptureKind="face"
      />
    </>
  );
};

export default SelfiePhoto;
