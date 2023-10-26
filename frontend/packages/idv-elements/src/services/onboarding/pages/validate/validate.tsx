import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import Error from '../../components/error';
import { useOnboardingMachine } from '../../components/machine-provider';
import useOnboardingValidate from './hooks/use-onboarding-validate';

const Validate = () => {
  const [state, send] = useOnboardingMachine();
  const { authToken } = state.context;
  const onboardingValidateMutation = useOnboardingValidate();
  const { isError } = onboardingValidateMutation;

  useEffectOnce(() => {
    if (onboardingValidateMutation.isLoading) {
      return;
    }

    onboardingValidateMutation.mutate(
      { authToken },
      {
        onSuccess: payload => {
          send({
            type: 'validationComplete',
            payload,
          });
        },
        onError: (error: unknown) => {
          console.error(
            'Error while validating onboarding',
            getErrorMessage(error),
          );
        },
      },
    );
  });

  return isError ? (
    <Error />
  ) : (
    <Container>
      <LoadingIndicator />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    min-height: var(--loading-container-min-height);
    height: 100%;
    justify-content: center;
    text-align: center;
  `}
`;

export default Validate;
