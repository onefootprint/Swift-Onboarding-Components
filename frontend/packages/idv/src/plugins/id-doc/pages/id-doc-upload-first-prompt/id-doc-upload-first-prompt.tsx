import { IcoIdGeneric40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import type { CountryCode } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types';
import { AnimatedLoadingSpinner, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { NavigationHeader } from '../../../../components';
import useIdvRequestErrorToast from '../../../../hooks/ui/use-idv-request-error-toast';
import { Logger } from '../../../../utils';
import FadeInContainer from '../../components/fade-in-container';
import IdDocPhotoButtons from '../../components/id-doc-photo-buttons';
import { useIdDocMachine } from '../../components/machine-provider';
import PromptWithGuidelines from '../../components/prompt-with-directions';
import useSubmitDocType from '../../hooks/use-submit-doc-type';
import detectWebcam from '../../utils/detect-webcam';
import { getCountryFromCode } from '../../utils/get-country-from-code';
import type { CaptureKind } from '../../utils/state-machine';
import { isSingleDocCountryMap } from '../../utils/state-machine/machine.utils';

const guidelineKeys: Partial<{
  [key in SupportedIdDocTypes]: string[];
}> = {
  [SupportedIdDocTypes.proofOfAddress]: [
    'gas-water-electricity-bill',
    'bank-credit-card-statement',
    'vehicle-voter-registration',
    'rental-agreement',
    'phone-internet-bill',
  ],
};

const docTypesWithAlertMessage = [SupportedIdDocTypes.proofOfAddress];

const IdDocUploadFirstPrompt = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: `id-doc.pages.id-doc-upload-first-prompt`,
  });
  const [state, send] = useIdDocMachine();
  const submitDocTypeMutation = useSubmitDocType();
  const requestErrorToast = useIdvRequestErrorToast();
  const {
    authToken,
    sandboxOutcome,
    device,
    supportedCountryAndDocTypes,
    idDoc: { type: docType, country },
    id,
    forceUpload,
  } = state.context;
  const isContextInitialized = docType && country && id;
  const singleDocCountryMap = isSingleDocCountryMap(state.context);
  const isMobile = device.type === 'mobile';

  useEffectOnce(() => {
    const intializeContext = async () => {
      const supportedCountry = Object.keys(
        supportedCountryAndDocTypes,
      )[0] as CountryCode;
      const supportedDocType =
        supportedCountryAndDocTypes[supportedCountry]?.[0];
      const hasWebcam = await detectWebcam();
      if (
        submitDocTypeMutation.isLoading ||
        !supportedDocType ||
        !supportedCountry
      ) {
        return;
      }

      submitDocTypeMutation.mutate(
        {
          authToken,
          documentType: supportedDocType,
          countryCode: supportedCountry,
          fixtureResult: sandboxOutcome,
          deviceType: isMobile ? 'mobile' : 'desktop',
          skipSelfie: !hasWebcam,
        },
        {
          onSuccess: data => {
            send({
              type: 'receivedCountryAndType',
              payload: {
                type: supportedDocType,
                country: supportedCountry,
                id: data.id,
              },
            });
          },
          onError: err => {
            Logger.error(
              `Failed to submit doc type and country from mobile upload-first page. Selected doctype: ${supportedDocType}, country ${supportedCountry}. Error: ${getErrorMessage(
                err,
              )}`,
              'id-doc-country-and-type-container',
            );
            requestErrorToast(err);
          },
        },
      );
    };
    if (!isContextInitialized) {
      intializeContext();
    }
  });

  if (!isContextInitialized) {
    return (
      <LoadingContainer>
        <AnimatedLoadingSpinner animationStart />
      </LoadingContainer>
    );
  }

  const guidelineKeysForDocType = guidelineKeys[docType];

  const guidelines = guidelineKeysForDocType
    ? guidelineKeysForDocType.map(key =>
        // @ts-ignore:next-line
        t(`${docType}.guidelines.${key}` as ParseKeys<`idv`>),
      )
    : [];

  const alertMessage = docTypesWithAlertMessage.includes(docType)
    ? // @ts-ignore:next-line
      (t(`${docType}.alert-messages` as ParseKeys<`idv`>) as string)
    : undefined;

  const handleComplete = (
    imageFile: File | Blob,
    extraCompressed: boolean,
    captureKind: CaptureKind,
  ) => {
    send({
      type: 'receivedImage',
      payload: {
        imageFile,
        extraCompressed,
        captureKind,
      },
    });
  };

  const handleClickBack = () => {
    send({ type: 'navigatedToPrev' });
  };

  return (
    <FadeInContainer>
      <NavigationHeader
        leftButton={
          singleDocCountryMap
            ? undefined
            : { variant: 'back', onBack: handleClickBack }
        }
      />
      <PromptContainer
        direction="column"
        gap={7}
        align="center"
        justify="center"
      >
        <PromptWithGuidelines
          // @ts-ignore:next-line
          title={t(`${docType}.title` as ParseKeys<`idv`>)}
          icon={isMobile ? IcoIdGeneric40 : undefined}
          // @ts-ignore:next-line
          description={t(`${docType}.description` as ParseKeys<`idv`>)}
          // @ts-ignore:next-line
          guidelines={guidelines}
          // @ts-ignore:next-line
          alertMessage={alertMessage}
        />
        <IdDocPhotoButtons
          onComplete={handleComplete}
          uploadFirst
          allowPdf
          hideCaptureButton={!isMobile || !!forceUpload}
        />
        <CountryNote>
          <Text variant="body-3" color="tertiary">{`${t(
            'issued-in',
          )} ${getCountryFromCode(country)?.label}`}</Text>
        </CountryNote>
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled(Stack)`
  height: 100%;
`;

const LoadingContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

const CountryNote = styled.div`
  ${({ theme }) => css`
    margin-top: calc(-1 * ${theme.spacing[4]});
  `}
`;

export default IdDocUploadFirstPrompt;
