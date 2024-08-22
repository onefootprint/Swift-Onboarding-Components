import { getCountryNameFromCode } from '@onefootprint/global-constants';
import { IcoShieldFlash40 } from '@onefootprint/icons';
import { DocumentRequestKind, DocumentUploadSettings } from '@onefootprint/types';
import { Divider, LinkButton, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import styled, { css } from 'styled-components';
import { NavigationHeader } from '../../../../../components';
import useOnboardingRequirementsMachine from '../../../../../pages/onboarding/pages/requirements/hooks/use-onboarding-requirements-machine';
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

  const [, sendOnboardingRequirements] = useOnboardingRequirementsMachine();
  const { device, hasBadConnectivity, requirement, obConfigSupportedCountries, orgId } = state.context;
  const hasPreferUploadSettings = requirement.uploadSettings === DocumentUploadSettings.preferUpload;
  const isMobile = device.type === 'mobile';
  const { kind: documentRequestKind } = requirement.config;
  const guidelines = useGuidelines({ docKind: documentRequestKind, orgId });
  const { title, description } = useTitleAndDescription(requirement.config);
  let alertMessage: string | undefined;
  if (
    obConfigSupportedCountries &&
    obConfigSupportedCountries.length === 1 &&
    documentRequestKind === DocumentRequestKind.ProofOfAddress
  ) {
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
  const handleContinueOnMobile = () => {
    sendOnboardingRequirements({
      type: 'continueOnMobile',
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
      <Stack height="100%" direction="column" gap={7} align="center" justify="center">
        <PromptWithGuidelines
          title={title}
          icon={IcoShieldFlash40}
          description={description}
          guidelines={guidelines}
          alertMessage={alertMessage}
        />
        <IdDocPhotoButtons
          onComplete={handleComplete}
          uploadFirst={
            documentRequestKind === DocumentRequestKind.Custom
              ? hasPreferUploadSettings
              : documentRequestKind !== DocumentRequestKind.ProofOfSsn
          }
          allowPdf={hasPreferUploadSettings}
          hideCaptureButton={!isMobile}
          onTakePhoto={handleTakePhoto}
          hasBadConnectivity={hasBadConnectivity}
        />
      </Stack>
      {isMobile ? null : (
        <Stack flexDirection="column" gap={5} alignItems="center">
          <FullWidthDivider variant="secondary" paddingTop={7} />
          <LinkButton onClick={handleContinueOnMobile}>{t('continue-on-mobile')}</LinkButton>
        </Stack>
      )}
    </FadeInContainer>
  );
};

const FullWidthDivider = styled(Divider)`
  ${({ theme }) => css`
    width: calc(100% + ${theme.spacing[10]});
  `}
`;

export default DocumentPrompt;
