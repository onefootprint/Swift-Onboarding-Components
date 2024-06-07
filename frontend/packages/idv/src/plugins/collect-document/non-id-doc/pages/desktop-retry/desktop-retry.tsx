import type { IdDocImageUploadError } from '@onefootprint/types';
import React from 'react';

import { NavigationHeader } from '../../../../../components';
import DesktopPhotoPrompt from '../../../components/desktop-photo-prompt';
import type { CaptureKind } from '../../../types';
import { useNonIdDocMachine } from '../../components/machine-provider';
import useDocName from '../../hooks/use-doc-name';

const DesktopRetry = () => {
  const [state, send] = useNonIdDocMachine();
  const { config, errors, hasBadConnectivity, uploadMode } = state.context;

  const docName = useDocName(config);

  const handleClickBack = () => {
    send({
      type: 'navigatedToPrompt',
    });
  };

  const handleComplete = (payload: {
    imageFile: File | Blob;
    extraCompressed?: boolean;
    captureKind: CaptureKind;
  }) => {
    send({
      type: 'receivedDocument',
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
      <NavigationHeader leftButton={{ variant: 'back', onBack: handleClickBack }} />
      <DesktopPhotoPrompt
        docName={docName}
        isRetry
        errors={errors}
        hasBadConnectivity={hasBadConnectivity}
        uploadMode={uploadMode}
        onUploadSuccess={handleComplete}
        onUploadError={handleUploadError}
      />
    </>
  );
};

export default DesktopRetry;
