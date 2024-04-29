import { DocumentRequestKind } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import { NavigationHeader } from '../../../../../components';
import Error from '../../../components/error';
import FadeInContainer from '../../../components/fade-in-container';
import IdDocPhotoButtons from '../../../components/id-doc-photo-buttons';
import type { CaptureKind } from '../../../types';
import { useNonIdDocMachine } from '../../components/machine-provider';
import useDocName from '../../hooks/use-doc-name';

const MobileRetry = () => {
  const [state, send] = useNonIdDocMachine();
  const { uploadMode, hasBadConnectivity, config, errors } = state.context;
  const { kind: documentRequestKind } = config;

  const docName = useDocName(config);

  const hideUploadButton = uploadMode === 'capture_only';
  const allowPdf = uploadMode === 'allow_upload';

  const handleClickBack = () => {
    send({
      type: 'navigatedToPrompt',
    });
  };

  const handleTakePhoto = () => {
    send({
      type: 'startImageCapture',
    });
  };

  const handleComplete = (payload: {
    imageFile: File | Blob;
    extraCompressed: boolean;
    captureKind: CaptureKind;
  }) => {
    send({
      type: 'receivedDocument',
      payload,
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
        <Error docName={docName} errors={errors || []} />
        <IdDocPhotoButtons
          onComplete={handleComplete}
          hideUploadButton={hideUploadButton}
          allowPdf={allowPdf}
          uploadFirst={documentRequestKind !== DocumentRequestKind.ProofOfSsn}
          onTakePhoto={handleTakePhoto}
          hasBadConnectivity={hasBadConnectivity}
        />
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled(Stack)`
  height: 100%;
`;

export default MobileRetry;
