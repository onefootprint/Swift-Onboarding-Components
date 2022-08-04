import { useTranslation } from 'hooks';
import IcoForbid40 from 'icons/ico/ico-forbid-40';
import React, { useEffect } from 'react';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import useOnboarding from 'src/hooks/use-onboarding';
import styled, { css } from 'styled-components';
import { LoadingIndicator, Typography } from 'ui';

const OnboardingVerification = () => {
  const { t } = useTranslation('pages.registration.onboarding-verification');
  const [state, send] = useBifrostMachine();
  const onboardingMutation = useOnboarding();
  const { context } = state;
  const { authToken } = context;
  const tenantPk = context.tenant.pk;

  useEffect(() => {
    if (!authToken || !tenantPk) {
      return;
    }
    onboardingMutation.mutate(
      { authToken, tenantPk },
      {
        onSuccess: ({
          missingAttributes,
          missingWebauthnCredentials,
          validationToken,
        }) => {
          send({
            type: Events.onboardingVerificationSucceeded,
            payload: {
              missingAttributes,
              missingWebauthnCredentials,
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

export default OnboardingVerification;
