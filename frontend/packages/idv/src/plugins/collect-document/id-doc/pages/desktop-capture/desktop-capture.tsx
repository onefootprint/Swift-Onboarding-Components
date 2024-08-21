import type { IdDocImageUploadError } from '@onefootprint/types';
import type { IdDocImageTypes } from '@onefootprint/types';
import type { ComponentProps } from 'react';

import { NavigationHeader } from '../../../../../components';
import DesktopPhotoPrompt from '../../../components/desktop-photo-prompt';
import { isSelfie } from '../../../utils/capture';
import useDocName from '../../hooks/use-doc-name';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

type DesktopCaptureProps = {
  imageType: `${IdDocImageTypes}`;
  isRetry?: boolean;
  onBack?: () => void;
  onComplete: ComponentProps<typeof DesktopPhotoPrompt>['onUploadSuccess'];
};

const DesktopCapture = ({ imageType, isRetry = false, onBack, onComplete }: DesktopCaptureProps) => {
  const [state, send] = useIdDocMachine();
  const { errors, hasBadConnectivity, idDoc, requirement } = state.context;
  const docType = idDoc.type;
  const countryCode = idDoc.country;
  const isSelfieCapture = isSelfie(imageType);
  const { getDocName, getSideName } = useDocName({ docType, imageType });

  if (!isSelfieCapture && (!docType || !countryCode)) return null;

  const handleUploadError = (errs: IdDocImageUploadError[]) => {
    send({
      type: 'uploadErrored',
      payload: { errors: errs.map(err => ({ errorType: err })) },
    });
  };

  return (
    <>
      <NavigationHeader
        leftButton={isSelfieCapture ? { variant: 'close', confirmClose: true } : { variant: 'back', onBack }}
      />
      <DesktopPhotoPrompt
        country={countryCode}
        docName={getDocName()}
        errors={errors}
        hasBadConnectivity={hasBadConnectivity}
        isRetry={isRetry}
        isSelfie={isSelfieCapture}
        onUploadError={handleUploadError}
        onUploadSuccess={onComplete}
        requirement={requirement}
        showCameraFallbackText={isSelfieCapture}
        sideName={getSideName()}
      />
    </>
  );
};

export default DesktopCapture;
