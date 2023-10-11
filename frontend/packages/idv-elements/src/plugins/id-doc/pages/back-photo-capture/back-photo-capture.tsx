import { useTranslation } from '@onefootprint/hooks';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

import PhotoCapture from '../../components/photo-capture/photo-capture';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import type { CaptureKind } from '../../utils/state-machine';

const ID_OUTLINE_WIDTH_RATIO = 0.9;
const ID_OUTLINE_HEIGHT_RATIO = 0.56;

const translationIndex: { [key in SupportedIdDocTypes]: string } = {
  [SupportedIdDocTypes.driversLicense]: 'driversLicense',
  [SupportedIdDocTypes.idCard]: 'idCard',
  [SupportedIdDocTypes.passport]: 'passport',
  [SupportedIdDocTypes.visa]: 'visa',
  [SupportedIdDocTypes.workPermit]: 'workPermit',
  [SupportedIdDocTypes.residenceDocument]: 'residenceDocument',
  [SupportedIdDocTypes.voterIdentification]: 'voterIdentification',
};

const BackPhotoCapture = () => {
  const { t } = useTranslation('pages.back-photo-capture');
  const [state, send] = useIdDocMachine();

  const {
    idDoc: { type: docType },
  } = state.context;

  if (!docType) return null;

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
      outlineHeightRatio={ID_OUTLINE_HEIGHT_RATIO}
      outlineWidthRatio={ID_OUTLINE_WIDTH_RATIO}
      cameraKind="back"
      outlineKind="full-frame"
      onComplete={onComplete}
      autocaptureKind="document"
      deviceKind="mobile"
      title={{
        camera: t(`title.camera.${translationIndex[docType]}`),
        preview: t(`title.preview.${translationIndex[docType]}`),
      }}
      subtitle={{ preview: t(`subtitle.preview`) }}
      onBack={handleClickBack}
    />
  );
};

export default BackPhotoCapture;
