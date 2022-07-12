import React, { useEffect } from 'react';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import useOnboarding from 'src/hooks/use-onboarding';
import styled from 'styled-components';
import { LoadingIndicator } from 'ui';

const OnboardingVerification = () => {
  const [state, send] = useBifrostMachine();
  const { context } = state;
  const onboardingMutation = useOnboarding();

  const startOnboarding = (authToken: string, tenantPk: string) => {
    onboardingMutation.mutate(
      { authToken, tenantPk },
      {
        onSuccess: ({ missingAttributes, missingWebauthnCredentials }) => {
          send({
            type: Events.onboardingVerificationSucceeded,
            payload: {
              missingAttributes,
              missingWebauthnCredentials,
            },
          });
        },
      },
    );
  };

  useEffect(() => {
    if (context.authToken && context.tenant.pk) {
      startOnboarding(context.authToken, context.tenant.pk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.authToken, context.tenant.pk]);

  // TODO: Create edge case errors screen
  // In theory this should not happen, but it's cover do cover
  // https://linear.app/footprint/issue/FP-566/create-edge-case-erro-scree-s
  if (!context.tenant.pk || !context.authToken) {
    return <div />;
  }

  // TODO: ERROR
  if (onboardingMutation.isError) {
    return <div />;
  }

  return (
    <Container>
      <LoadingIndicator />
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  height: 188px;
  justify-content: center;
`;

export default OnboardingVerification;
