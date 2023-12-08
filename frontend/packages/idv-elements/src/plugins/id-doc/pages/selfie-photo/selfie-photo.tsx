import { useTranslation } from '@onefootprint/hooks';
import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';

import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import type { CaptureKind } from '../../utils/state-machine';

const FACE_OUTLINE_TO_WIDTH_RATIO = 0.7;

const SelfiePhoto = () => {
  const { t } = useTranslation('pages.selfie-photo');
  const [, send] = useIdDocMachine();

  const onComplete = (
    imageFile: File,
    extraCompressed: boolean,
    captureKind: CaptureKind,
  ) =>
    send({
      type: 'receivedImage',
      payload: {
        imageFile,
        extraCompressed,
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
      onComplete={onComplete}
      autocaptureKind="face"
      deviceKind="mobile"
      title={{ camera: t('title'), preview: t('title') }}
      onBack={handleClickBack}
      imageType={IdDocImageTypes.selfie}
    />
  );
};

export default SelfiePhoto;
