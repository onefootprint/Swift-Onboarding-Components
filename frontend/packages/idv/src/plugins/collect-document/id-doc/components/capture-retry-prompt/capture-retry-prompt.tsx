import { DocumentUploadSettings, type IdDocImageTypes } from '@onefootprint/types';

import { Stack } from '@onefootprint/ui';
import { NavigationHeader } from '../../../../../components';
import ErrorComponent from '../../../components/error';
import FadeInContainer from '../../../components/fade-in-container';
import IdDocPhotoButtons from '../../../components/id-doc-photo-buttons';
import type { ReceivedImagePayload } from '../../../types';
import { isSelfie } from '../../../utils/capture';
import { getCountryFromCode } from '../../../utils/get-country-from-code';
import useDocName from '../../hooks/use-doc-name';
import { useIdDocMachine } from '../machine-provider';

type CaptureRetryPromptProps = {
  imageType: `${IdDocImageTypes}`;
  onComplete: (payload: ReceivedImagePayload) => void;
};

const CaptureRetryPrompt = ({ imageType, onComplete }: CaptureRetryPromptProps) => {
  const [state, send] = useIdDocMachine();
  const { errors, forceUpload, hasBadConnectivity, idDoc, requirement } = state.context;
  const docType = idDoc.type;
  const docCountry = idDoc.country;
  const { getDocName, getSideName } = useDocName({ docType, imageType });

  if (!docType || !docCountry) return null;

  const docName = getDocName();
  const sideName = getSideName();
  const countryName = getCountryFromCode(docCountry)?.label || docCountry;

  const hideUploadButton = isSelfie(imageType) ? !forceUpload : false;
  const hideCaptureButton = !!forceUpload;
  const hideUpload =
    hideUploadButton || (requirement.uploadSettings === DocumentUploadSettings.captureOnlyOnMobile && !forceUpload);
  const allowPdf = requirement.uploadSettings === DocumentUploadSettings.preferUpload;

  return (
    <FadeInContainer>
      <NavigationHeader
        position="floating"
        leftButton={
          !isSelfie(imageType) ? { variant: 'back', onBack: () => send({ type: 'navigatedToCountryDoc' }) } : undefined
        }
      />
      <Stack height="100%" direction="column" gap={7} align="center" justify="center">
        <ErrorComponent docName={docName} sideName={sideName} errors={errors || []} countryName={countryName} />
        <IdDocPhotoButtons
          onComplete={onComplete}
          hideCaptureButton={hideCaptureButton}
          hideUploadButton={hideUpload}
          uploadFirst={!!forceUpload}
          onTakePhoto={() => send({ type: 'startImageCapture' })}
          hasBadConnectivity={hasBadConnectivity}
          allowPdf={allowPdf}
        />
      </Stack>
    </FadeInContainer>
  );
};

export default CaptureRetryPrompt;
