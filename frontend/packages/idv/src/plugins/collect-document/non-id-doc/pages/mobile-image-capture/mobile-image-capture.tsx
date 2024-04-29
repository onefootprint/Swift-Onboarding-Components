import { useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import PhotoCapture from '../../../components/photo-capture';
import transformCase from '../../../id-doc/utils/transform-case';
import type { CaptureKind } from '../../../types';
import { useNonIdDocMachine } from '../../components/machine-provider';
import useDocName from '../../hooks/use-doc-name';

const OUTLINE_HEIGHT_RATIO = 0.9;
const OUTLINE_WIDTH_RATIO = 0.9;

const MobileImageCapture = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.non-id-doc.pages.mobile-image-capture',
  });
  const [state, send] = useNonIdDocMachine();
  const { hasBadConnectivity, orgId, config } = state.context;
  const toast = useToast();
  const docName = useDocName(config);

  const onComplete = (
    imageFile: File | Blob,
    extraCompressed: boolean,
    captureKind: CaptureKind,
  ) =>
    send({
      type: 'receivedDocument',
      payload: {
        imageFile,
        extraCompressed,
        captureKind,
      },
    });

  const handleClickBack = () => {
    send({ type: 'navigatedToPrev' });
  };

  const handleCameraError = () => {
    send({ type: 'cameraErrored' });
  };

  const handleCameraStuck = () => {
    toast.show({
      title: t('camera-stuck.title'),
      description: t('camera-stuck.description'),
      variant: 'error',
    });
    send({ type: 'cameraStuck' });
  };

  return (
    <PhotoCapture
      autocaptureKind="nonIdDoc"
      cameraKind="back"
      deviceKind="mobile"
      docName={docName}
      orgId={orgId}
      uploadMode="allow_upload"
      hasBadConnectivity={hasBadConnectivity}
      onCameraErrored={handleCameraError}
      onCameraStuck={handleCameraStuck}
      onComplete={onComplete}
      onBack={handleClickBack}
      outlineHeightRatio={OUTLINE_HEIGHT_RATIO}
      outlineWidthRatio={OUTLINE_WIDTH_RATIO}
      title={{
        camera: transformCase(docName, 'first-letter-upper-only'),
        preview: transformCase(docName, 'first-letter-upper-only'),
      }}
    />
  );
};

export default MobileImageCapture;
