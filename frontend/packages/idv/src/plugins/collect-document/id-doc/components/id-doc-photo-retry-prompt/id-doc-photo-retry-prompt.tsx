import type { SupportedIdDocTypes } from '@onefootprint/types';
import { IdDocImageTypes } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import { NavigationHeader } from '../../../../../components';
import Error from '../../../components/error';
import FadeInContainer from '../../../components/fade-in-container';
import IdDocPhotoButtons from '../../../components/id-doc-photo-buttons';
import type { CaptureKind, IdDocImageErrorType } from '../../../types';
import useDocName from '../../hooks/use-doc-name';
import { useIdDocMachine } from '../machine-provider';

type IdDocPhotoRetryPromptProps = {
  docType: SupportedIdDocTypes;
  countryName: string;
  imageType: IdDocImageTypes;
  errors: IdDocImageErrorType[];
  onComplete: (payload: {
    imageFile: File | Blob;
    extraCompressed: boolean;
    captureKind: CaptureKind;
  }) => void;
  hideUploadButton?: boolean;
};

const IdDocPhotoRetryPrompt = ({
  docType,
  countryName,
  imageType,
  errors,
  onComplete,
  hideUploadButton,
}: IdDocPhotoRetryPromptProps) => {
  const [state, send] = useIdDocMachine();
  const { forceUpload, uploadMode, hasBadConnectivity } = state.context;
  const { getDocName, getSideName } = useDocName({ docType, imageType });
  const docName = getDocName();
  const sideName = getSideName();

  const hideCaptureButton = !!forceUpload;
  const hideUpload =
    hideUploadButton || (uploadMode === 'capture_only' && !forceUpload);
  const allowPdf = uploadMode === 'allow_upload';

  const handleClickBack = () => {
    send({
      type: 'navigatedToCountryDoc',
    });
  };

  const handleTakePhoto = () => {
    send({
      type: 'startImageCapture',
    });
  };

  return (
    <FadeInContainer>
      <NavigationHeader
        leftButton={
          imageType !== IdDocImageTypes.selfie
            ? { variant: 'back', onBack: handleClickBack }
            : undefined
        }
        position="floating"
      />
      <PromptContainer
        direction="column"
        gap={7}
        align="center"
        justify="center"
      >
        <Error
          docName={docName}
          sideName={sideName}
          errors={errors}
          countryName={countryName}
        />
        <IdDocPhotoButtons
          onComplete={onComplete}
          hideCaptureButton={hideCaptureButton}
          hideUploadButton={hideUpload}
          uploadFirst={!!forceUpload}
          onTakePhoto={handleTakePhoto}
          hasBadConnectivity={hasBadConnectivity}
          allowPdf={allowPdf}
        />
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled(Stack)`
  height: 100%;
`;
export default IdDocPhotoRetryPrompt;
