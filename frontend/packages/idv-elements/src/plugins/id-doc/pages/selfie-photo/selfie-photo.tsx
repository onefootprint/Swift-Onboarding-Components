import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import type { CaptureKind } from '../../utils/state-machine';

const FACE_OUTLINE_TO_WIDTH_RATIO = 0.7;

const SelfiePhoto = () => {
  const { t } = useTranslation('pages.selfie-photo');
  const [, send] = useIdDocMachine();

  const onComplete = (imageFile: File, captureKind?: CaptureKind) =>
    send({
      type: 'receivedImage',
      payload: {
        imageFile,
        captureKind,
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
        deviceKind="mobile"
      />
    </>
  );
};

export default SelfiePhoto;
