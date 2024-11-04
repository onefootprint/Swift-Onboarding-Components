import type { IdDocImageUploadError } from '@onefootprint/types';

import { NavigationHeader } from '@/idv/components';
import DesktopPhotoPrompt from '../../../components/desktop-photo-prompt';
import type { ReceivedImagePayload } from '../../../types';
import { useNonIdDocMachine } from '../../components/machine-provider';
import useDocName from '../../hooks/use-doc-name';

const DesktopRetry = () => {
  const [state, send] = useNonIdDocMachine();
  const { requirement, errors, hasBadConnectivity } = state.context;

  const docName = useDocName(requirement.config);

  const handleClickBack = () => send({ type: 'navigatedToPrompt' });

  const handleComplete = (payload: ReceivedImagePayload) => send({ type: 'receivedDocument', payload });

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
        requirement={requirement}
        onUploadSuccess={handleComplete}
        onUploadError={handleUploadError}
      />
    </>
  );
};

export default DesktopRetry;
