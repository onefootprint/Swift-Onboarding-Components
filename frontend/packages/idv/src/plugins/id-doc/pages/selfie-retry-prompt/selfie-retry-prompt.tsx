import { IdDocImageTypes } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Error from '../../components/error/error';
import FadeInContainer from '../../components/fade-in-container';
import IdDocPhotoRetryPrompt from '../../components/id-doc-photo-retry-prompt';
import { useIdDocMachine } from '../../components/machine-provider';
import { getCountryFromCode } from '../../utils/get-country-from-code';
import type { CaptureKind } from '../../utils/state-machine';

const SelfieRetryPrompt = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.pages.selfie-retry-prompt',
  });

  const {
    idDoc: { type, country },
    forceUpload,
    errors,
  } = state.context;

  if (!type || !country) {
    return null;
  }

  const countryName = getCountryFromCode(country)?.label;

  const handleClick = () => {
    send({ type: 'startImageCapture' });
  };

  const handleComplete = (
    imageFile: File | Blob,
    extraCompressed: boolean,
    captureKind: CaptureKind,
  ) =>
    send({
      type: 'receivedImage',
      payload: {
        imageFile,
        extraCompressed,
        captureKind,
      },
    });

  if (forceUpload) {
    return (
      <IdDocPhotoRetryPrompt
        docType={type}
        countryName={countryName ?? country}
        imageType={IdDocImageTypes.front}
        onComplete={handleComplete}
        errors={errors || []}
      />
    );
  }

  return (
    <FadeInContainer>
      <PromptContainer>
        <Error
          docType={type}
          countryName={countryName ?? country}
          imageType={IdDocImageTypes.selfie}
          errors={errors || []}
        />
        <Button fullWidth onClick={handleClick} size="large">
          {t('cta')}
        </Button>
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    align-items: center;
    justify-content: center;
    height: 100%;
  `}
`;

export default SelfieRetryPrompt;
