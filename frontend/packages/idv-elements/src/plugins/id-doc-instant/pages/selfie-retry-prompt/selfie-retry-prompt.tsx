import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Error from '../../components/error/error';
import FadeInContainer from '../../components/fade-in-container';
import { useIdDocMachine } from '../../components/machine-provider';
import { ImageTypes } from '../../constants/image-types';

const SelfieRetryPrompt = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('pages.selfie-retry-prompt');

  const handleClick = () => {
    send({ type: 'startSelfieCapture' });
  };

  return (
    <FadeInContainer>
      <PromptContainer>
        <Error
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
