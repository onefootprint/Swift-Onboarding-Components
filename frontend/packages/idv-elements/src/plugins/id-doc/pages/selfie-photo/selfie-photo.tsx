import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

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
    <PhotoCapture
      outlineHeightRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
      outlineWidthRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
      cameraKind="front"
      outlineKind="corner"
      onComplete={onComplete}
      autocaptureKind="face"
      deviceKind="mobile"
      title={{ camera: t('title'), preview: t('title') }}
      onBack={handleClickBack}
    />
  );
};

export default SelfiePhoto;
