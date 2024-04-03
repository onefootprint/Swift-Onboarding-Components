import type { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import { NavigationHeader } from '../../../../components';
import type {
  CaptureKind,
  IdDocImageErrorType,
} from '../../utils/state-machine';
import Error from '../error';
import FadeInContainer from '../fade-in-container';
import IdDocPhotoButtons from '../id-doc-photo-buttons';
import { useIdDocMachine } from '../machine-provider';

type IdDocPhotoRetryPromptProps = {
  docType: SupportedIdDocTypes;
  countryName: string;
  imageType: IdDocImageTypes.front | IdDocImageTypes.back;
  errors: IdDocImageErrorType[];
  onComplete: (
    imageFile: File | Blob,
    extraCompressed: boolean,
    captureKind: CaptureKind,
  ) => void;
};

const IdDocPhotoRetryPrompt = ({
  docType,
  countryName,
  imageType,
  errors,
  onComplete,
}: IdDocPhotoRetryPromptProps) => {
  const [state, send] = useIdDocMachine();
  const {
    forceUpload,
    requirement: { uploadMode },
  } = state.context;

  const hideCaptureButton = !!forceUpload;
  const hideUploadButton = uploadMode === 'capture_only' && !forceUpload;

  const handleClickBack = () => {
    send({
      type: 'navigatedToCountryDoc',
    });
  };

  return (
    <FadeInContainer>
      <NavigationHeader
        leftButton={{ variant: 'back', onBack: handleClickBack }}
        position="floating"
      />
      <PromptContainer
        direction="column"
        gap={7}
        align="center"
        justify="center"
      >
        <Error
          imageType={imageType}
          errors={errors}
          docType={docType}
          countryName={countryName}
        />
        <IdDocPhotoButtons
          onComplete={onComplete}
          hideCaptureButton={hideCaptureButton}
          hideUploadButton={hideUploadButton}
          uploadFirst={!!forceUpload}
        />
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled(Stack)`
  height: 100%;
`;
export default IdDocPhotoRetryPrompt;
