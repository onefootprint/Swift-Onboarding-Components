import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Error from '../../components/error/error';
import FadeInContainer from '../../components/fade-in-container';
import { useIdDocMachine } from '../../components/machine-provider';
import { ImageTypes } from '../../constants/image-types';
import { getCountryFromCode3 } from '../../utils/get-country-from-code';

const SelfieRetryPrompt = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('pages.selfie-retry-prompt');

  const {
    idDoc: { type, country },
  } = state.context;

  if (!type || !country) {
    return null;
  }

  const countryName = getCountryFromCode3(country)?.label;

  const handleClick = () => {
    send({ type: 'startImageCapture' });
  };

  return (
    <FadeInContainer>
      <PromptContainer>
        <Error
          docType={type}
          countryName={countryName ?? country}
          imageType={ImageTypes.selfie}
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
  `}
`;

export default SelfieRetryPrompt;
