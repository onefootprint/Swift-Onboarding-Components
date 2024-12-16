import { postHostedIdentifyVerifyMutation, postHostedOnboardingMutation } from '@onefootprint/axios';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import Header from '../../components/header';
import Layout from '../../components/layout';
import LoadingSpinner from '../../components/ui/loading-spinner';
import logo from '../../images/avis.png';

type WaitingConfirmationProps = {
  onCancel: () => void;
  onDone: (authToken: string) => void;
  tokens: {
    challengeToken: string;
    authToken: string;
  };
};

const WaitingConfirmation = ({ tokens, onCancel, onDone }: WaitingConfirmationProps) => {
  const mutation = useMutation(
    postHostedIdentifyVerifyMutation({
      headers: {
        'X-Fp-Authorization': tokens.authToken,
      },
    }),
  );

  const pollVerification = () => {
    mutation.mutate({
      body: {
        challengeResponse: '',
        challengeToken: tokens.challengeToken,
        scope: 'onboarding',
      },
    });
  };

  useEffect(() => {
    const interval = setInterval(pollVerification, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout onClose={onCancel}>
      <img src={logo} alt="Avis Logo" className="mx-auto mb-6" width={92} height={30} />
      <Header
        title="Waiting for customer..."
        subtitle="Text message sent to customer's phone number. Ask them to continue from their phone."
      />
      <LoadingSpinner className="mx-auto mb-4" />
      {mutation.data && <StartOnboarding authToken={mutation.data.authToken} onDone={onDone} />}
    </Layout>
  );
};

const StartOnboarding = ({ authToken, onDone }: { authToken: string; onDone: (authToken: string) => void }) => {
  const startOnboardingMutation = useMutation(
    postHostedOnboardingMutation({
      headers: {
        'X-Fp-Authorization': authToken,
      },
    }),
  );

  useEffect(() => {
    startOnboardingMutation.mutate(
      {
        body: {
          fixtureResult: 'pass',
        },
      },
      {
        onSuccess: response => {
          onDone(response.authToken);
        },
      },
    );
  }, []);

  return null;
};

export default WaitingConfirmation;
