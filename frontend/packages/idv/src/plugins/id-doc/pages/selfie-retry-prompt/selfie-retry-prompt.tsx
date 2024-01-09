import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDocImageTypes } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';

import Error from '../../components/error/error';
import FadeInContainer from '../../components/fade-in-container';
import { useIdDocMachine } from '../../components/machine-provider';
import { getCountryFromCode } from '../../utils/get-country-from-code';

const SelfieRetryPrompt = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('id-doc.pages.selfie-retry-prompt');

  const {
    idDoc: { type, country },
  } = state.context;

  if (!type || !country) {
    return null;
  }

  const countryName = getCountryFromCode(country)?.label;

  const handleClick = () => {
    send({ type: 'startImageCapture' });
  };

  return (
    <FadeInContainer>
      <PromptContainer>
        <Error
          docType={type}
          countryName={countryName ?? country}
          imageType={IdDocImageTypes.selfie}
          errors={state.context.errors || []}
        />
        <Button fullWidth onClick={handleClick}>
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
