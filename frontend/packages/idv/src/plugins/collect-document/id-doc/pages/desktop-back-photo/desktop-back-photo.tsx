import type { IdDocImageUploadError } from '@onefootprint/types';
import { IdDocImageTypes } from '@onefootprint/types';

import { NavigationHeader } from '../../../../../components';
import DesktopPhotoPrompt from '../../../components/desktop-photo-prompt';
import type { CaptureKind } from '../../../types';
import useDocName from '../../hooks/use-doc-name';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const DesktopBackPhoto = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type, country },
    hasBadConnectivity,
    requirement,
  } = state.context;
  const { getDocName, getSideName } = useDocName({
    docType: type,
    imageType: IdDocImageTypes.back,
  });

  if (!type || !country) {
    return null;
  }

  const docName = getDocName();
  const sideName = getSideName();

  const handleClickBack = () => {
    send({
      type: 'navigatedToCountryDoc',
    });
  };

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
      <NavigationHeader leftButton={{ variant: 'back', onBack: handleClickBack }} />
      <DesktopPhotoPrompt
        docName={docName}
        sideName={sideName}
        country={country}
        hasBadConnectivity={hasBadConnectivity}
        requirement={requirement}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
    </>
  );
};

export default DesktopBackPhoto;
