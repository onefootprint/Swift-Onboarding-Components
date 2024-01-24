import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  [SupportedIdDocTypes.ssnCard]: 'ssnCard',
  [SupportedIdDocTypes.lease]: 'lease',
  [SupportedIdDocTypes.bankStatement]: 'bankStatement',
  [SupportedIdDocTypes.utilityBill]: 'utilityBill',
};

const FrontPhotoCapture = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.pages.front-photo-capture',
  });
  const [state, send] = useIdDocMachine();

  const {
    idDoc: { type: docType },
  } = state.context;

  if (!docType) return null;

  const onComplete = (
    imageFile: File | Blob,
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
    send({ type: 'navigatedToPrev' });
  };

  const translationKey = translationIndex[docType];
  const camera = t(
    `title.camera.${translationKey}` as unknown as TemplateStringsArray,
  ) as unknown as string;
  const preview = t(
    `title.preview.${translationKey}` as unknown as TemplateStringsArray,
  ) as unknown as string;

  return (
    <PhotoCapture
      outlineHeightRatio={ID_OUTLINE_HEIGHT_RATIO}
      outlineWidthRatio={ID_OUTLINE_WIDTH_RATIO}
      cameraKind="back"
      onComplete={onComplete}
      autocaptureKind="document"
      deviceKind="mobile"
      title={{
        camera,
        preview,
      }}
      subtitle={{ preview: t(`subtitle.preview`) }}
      onBack={handleClickBack}
      imageType={IdDocImageTypes.front}
    />
  );
};

export default FrontPhotoCapture;
