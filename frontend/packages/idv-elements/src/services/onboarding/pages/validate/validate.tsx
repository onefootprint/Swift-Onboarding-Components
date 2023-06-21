import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useOnboardingMachine } from '../../components/machine-provider';
import useOnboardingValidate from './hooks/use-onboarding-validate';

const Validate = () => {
  const onboardingValidateMutation = useOnboardingValidate();
  const { t } = useTranslation('pages.validate');
  const [state, send] = useOnboardingMachine();
  const { authToken } = state.context;

  useEffectOnce(() => {
    onboardingValidateMutation.mutate(
      { authToken },
      {
        onSuccess: payload => {
          send({
            type: 'validationComplete',
            payload,
          });
        },
        onError: console.error,
      },
    );
  });

  if (onboardingValidateMutation.isError) {
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

export default Validate;
