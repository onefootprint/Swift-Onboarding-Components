import React from 'react';
import { useTranslation } from 'react-i18next';

import PhotoCapture from '../../../components/photo-capture/photo-capture';
import type { CaptureKind } from '../../../types';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const FACE_OUTLINE_TO_WIDTH_RATIO = 0.7;

const SelfiePhoto = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.pages.selfie-photo',
  });
  const [state, send] = useIdDocMachine();
  const { orgId, requirement, hasBadConnectivity } = state.context;

  const onComplete = (imageFile: File | Blob, extraCompressed: boolean, captureKind: CaptureKind) =>
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
      autocaptureKind="face"
      cameraKind="front"
      deviceKind="mobile"
      orgId={orgId}
      requirement={requirement}
      hasBadConnectivity={hasBadConnectivity}
      outlineHeightRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
      outlineWidthRatio={FACE_OUTLINE_TO_WIDTH_RATIO}
      title={{ camera: t('title'), preview: t('title') }}
      onComplete={onComplete}
      onBack={handleClickBack}
    />
  );
};

export default SelfiePhoto;
