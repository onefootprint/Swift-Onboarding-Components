import { useTranslation } from '@onefootprint/hooks';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
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

  const onComplete = (
    imageString: string,
    mimeType: string,
    captureKind?: CaptureKind,
  ) =>
    send({
      type: 'receivedImage',
      payload: {
        imageString,
        mimeType,
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
          title: t(`title.${translationIndex[docType]}`),
        }}
      />
      <PhotoCapture
        outlineHeightRatio={ID_OUTLINE_HEIGHT_RATIO}
        outlineWidthRatio={ID_OUTLINE_WIDTH_RATIO}
        cameraKind="back"
        outlineKind="full-frame"
        onComplete={onComplete}
        autocaptureKind="document"
        deviceKind="mobile"
      />
    </>
  );
};

export default BackPhotoCapture;
