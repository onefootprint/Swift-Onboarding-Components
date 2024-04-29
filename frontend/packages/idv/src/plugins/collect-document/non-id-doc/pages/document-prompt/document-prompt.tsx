import { getCountryNameFromCode } from '@onefootprint/global-constants';
import { IcoShieldFlash24 } from '@onefootprint/icons';
import { DocumentRequestKind } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { NavigationHeader } from '../../../../../components';
import FadeInContainer from '../../../components/fade-in-container';
import IdDocPhotoButtons from '../../../components/id-doc-photo-buttons';
import PromptWithGuidelines from '../../../components/prompt-with-guidelines';
import type { CaptureKind } from '../../../types';
import { useNonIdDocMachine } from '../../components/machine-provider';
import useGuidelines from './hooks/use-guidelines';
import useTitleAndDescription from './hooks/use-title-and-description';

const DocumentPrompt = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.non-id-doc.pages.document-prompt',
  });
  const [state, send] = useNonIdDocMachine();
  const {
    device,
    config,
    hasBadConnectivity,
    uploadMode,
    obConfigSupportedCountries,
  } = state.context;
  const allowPdf = uploadMode === 'allow_upload';
  const isMobile = device.type === 'mobile';
  const { kind: documentRequestKind } = config;
  const guidelines = useGuidelines(documentRequestKind);
  const { title, description } = useTitleAndDescription(config);
  let alertMessage: string | undefined;
  if (obConfigSupportedCountries && obConfigSupportedCountries.length === 1) {
    alertMessage = t('single-country-alert', {
      country: getCountryNameFromCode(obConfigSupportedCountries[0]),
    });
  }

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

  const handleTakePhoto = () => {
    send({
      type: 'startImageCapture',
    });
  };

  return (
    <FadeInContainer>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <PromptContainer
        direction="column"
        gap={7}
        align="center"
        justify="center"
      >
        <PromptWithGuidelines
          title={title}
          icon={IcoShieldFlash24}
          description={description}
          guidelines={guidelines}
          alertMessage={alertMessage}
        />
        <IdDocPhotoButtons
          onComplete={handleComplete}
          uploadFirst={documentRequestKind !== DocumentRequestKind.ProofOfSsn}
          allowPdf={allowPdf}
          hideCaptureButton={!isMobile}
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

export default DocumentPrompt;
