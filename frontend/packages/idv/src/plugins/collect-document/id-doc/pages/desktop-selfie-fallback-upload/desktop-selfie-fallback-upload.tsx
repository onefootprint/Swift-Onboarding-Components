import type { IdDocImageUploadError } from '@onefootprint/types';
import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';

import { NavigationHeader } from '../../../../../components';
import DesktopPhotoPrompt from '../../../components/desktop-photo-prompt';
import type { CaptureKind } from '../../../types';
import { useIdDocMachine } from '../../components/machine-provider';
import useDocName from '../../hooks/use-doc-name';

const DesktopSelfieFallbackUpload = () => {
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity, uploadMode } = state.context;
  const { getSideName } = useDocName({
    imageType: IdDocImageTypes.selfie,
  });
  const sideName = getSideName();

  const handleUploadSuccess = (payload: {
    imageFile: File | Blob;
    captureKind: CaptureKind;
    extraCompressed?: boolean;
  }) => {
    send({
      type: 'receivedImage',
      payload,
    });
  };

  const handleUploadError = (errs: IdDocImageUploadError[]) => {
    send({
      type: 'uploadErrored',
      payload: {
        errors: errs.map(err => ({ errorType: err })),
      },
    });
  };

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <DesktopPhotoPrompt
        sideName={sideName}
        hasBadConnectivity={hasBadConnectivity}
        uploadMode={uploadMode}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        showCameraFallbackText
        isSelfie
      />
    </>
  );
};

export default DesktopSelfieFallbackUpload;
