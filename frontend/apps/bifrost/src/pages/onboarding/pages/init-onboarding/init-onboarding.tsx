import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import useOnboarding from 'src/hooks/use-onboarding';
import { Events } from 'src/utils/state-machine/onboarding';
import styled, { css } from 'styled-components';

import useOnboardingMachine from '../../../../hooks/use-onboarding-machine';

const InitOnboarding = () => {
  const { t } = useTranslation('pages.init-onboarding');
  const [state, send] = useOnboardingMachine();
  const { context } = state;
  const { authToken } = context;
  const onboardingMutation = useOnboarding();
  const tenantPk = context.tenant.pk;

  useEffect(() => {
    if (!authToken || !tenantPk) {
      return;
    }
    onboardingMutation.mutate(
      { authToken, tenantPk },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, tenantPk]);

  if (!context.tenant.pk || !context.authToken || onboardingMutation.isError) {
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
    row-gap: ${theme.spacing[2]}px;
    justify-content: center;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]}px;
    height: 188px;
    justify-content: center;
    text-align: center;
  `}
`;

export default InitOnboarding;
