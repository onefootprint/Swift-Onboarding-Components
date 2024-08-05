import { DocumentRequestKind, DocumentUploadSettings } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';

import { NavigationHeader } from '../../../../../components';
import ErrorComponent from '../../../components/error';
import FadeInContainer from '../../../components/fade-in-container';
import IdDocPhotoButtons from '../../../components/id-doc-photo-buttons';
import { useNonIdDocMachine } from '../../components/machine-provider';
import useDocName from '../../hooks/use-doc-name';

const MobileRetry = () => {
  const [state, send] = useNonIdDocMachine();
  const { requirement, hasBadConnectivity, errors } = state.context;
  const { kind: documentRequestKind } = requirement.config;

  const docName = useDocName(requirement.config);

  const hideUploadButton = requirement.uploadSettings === DocumentUploadSettings.captureOnlyOnMobile;
  const allowPdf = requirement.uploadSettings === DocumentUploadSettings.preferUpload;

  return (
    <FadeInContainer>
      <NavigationHeader
        leftButton={{ variant: 'back', onBack: () => send({ type: 'navigatedToPrompt' }) }}
        position="floating"
      />
      <Stack height="100%" direction="column" gap={7} align="center" justify="center">
        <ErrorComponent docName={docName} errors={errors || []} />
        <IdDocPhotoButtons
          onComplete={payload => send({ type: 'receivedDocument', payload })}
          hideUploadButton={hideUploadButton}
          allowPdf={allowPdf}
          uploadFirst={documentRequestKind !== DocumentRequestKind.ProofOfSsn}
          onTakePhoto={() => send({ type: 'startImageCapture' })}
          hasBadConnectivity={hasBadConnectivity}
        />
      </Stack>
    </FadeInContainer>
  );
};

export default MobileRetry;
