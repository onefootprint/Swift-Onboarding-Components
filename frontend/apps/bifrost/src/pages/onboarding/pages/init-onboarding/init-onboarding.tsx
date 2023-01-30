import { useOnboarding } from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';
import { Events } from 'src/utils/state-machine/onboarding';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useOnboardingMachine from '../../../../hooks/use-onboarding-machine';

const InitOnboarding = () => {
  const { t } = useTranslation('pages.init-onboarding');
  const [state, send] = useOnboardingMachine();
  const { authToken } = state.context;
  const onboardingMutation = useOnboarding();

  useEffectOnce(() => {
    if (!authToken || onboardingMutation.isLoading) {
      return;
    }
    onboardingMutation.mutate(
      { authToken },
      {
        onSuccess: ({ validationToken }) => {
          send({
            type: Events.onboardingInitialized,
            payload: {
              validationToken,
            },
          });
        },
      },
    );
  });

  if (!authToken || onboardingMutation.isError) {
    return (
      <Container>
        <TitleContainer>
          <IcoForbid40 color="error" />
          <Typography variant="heading-3">{t('error.title')}</Typography>
        </TitleContainer>
        <Typography variant="body-2">{t('error.description')}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <LoadingIndicator />
    </Container>
  );
};

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
    justify-content: center;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    min-height: var(--loading-container-min-height);
    justify-content: center;
    text-align: center;
  `}
`;

export default InitOnboarding;
