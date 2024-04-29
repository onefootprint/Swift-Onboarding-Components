import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import PhotoCapture from '../../../components/photo-capture/photo-capture';
import type { CaptureKind } from '../../../types';
import useDocName from '../../hooks/use-doc-name';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import transformCase from '../../utils/transform-case';

const ID_OUTLINE_WIDTH_RATIO = 0.9;
const ID_OUTLINE_HEIGHT_RATIO = 0.56;

const FrontPhotoCapture = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.pages.front-photo-capture',
  });
  const [state, send] = useIdDocMachine();

  const {
    idDoc: { type: docType },
    orgId,
    uploadMode,
    hasBadConnectivity,
  } = state.context;
  const { getDocName, getSideName } = useDocName({
    docType,
    imageType: IdDocImageTypes.front,
  });
  if (!docType) return null;
  const docName = getDocName();
  const docNameCapitalized = transformCase(docName, 'first-letter-upper-only');
  const sideName = getSideName();
  const sideNameCapitalized = transformCase(sideName, 'upper');
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
  const handleCameraStuck = () => {
    send({ type: 'cameraStuck' });
  };
  const handleCameraErrored = () => {
    send({ type: 'cameraErrored' });
  };

  const cameraTitle = `${docNameCapitalized} · ${sideNameCapitalized}`;
  const previewTitle = `${docNameCapitalized}`;

  return (
    <PhotoCapture
      autocaptureKind="idDoc"
      cameraKind="back"
      deviceKind="mobile"
      sideName={sideName}
      docName={docName}
      orgId={orgId}
      uploadMode={uploadMode}
      hasBadConnectivity={hasBadConnectivity}
      outlineHeightRatio={ID_OUTLINE_HEIGHT_RATIO}
      outlineWidthRatio={ID_OUTLINE_WIDTH_RATIO}
      title={{
        camera: cameraTitle,
        preview: previewTitle,
      }}
      subtitle={{ preview: t(`subtitle.preview`) }}
      onComplete={onComplete}
      onBack={handleClickBack}
      onCameraStuck={handleCameraStuck}
      onCameraErrored={handleCameraErrored}
    />
  );
};

export default FrontPhotoCapture;
