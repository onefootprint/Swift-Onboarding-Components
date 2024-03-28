import { getErrorMessage } from '@onefootprint/request';
import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { useOnboardingValidate } from '../../../../hooks';
import Error from '../../components/error';
import { useOnboardingMachine } from '../../components/machine-provider';

const Validate = () => {
  const [state, send] = useOnboardingMachine();
  const {
    idvContext: { authToken },
  } = state.context;
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
      <AnimatedLoadingSpinner animationStart />
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
