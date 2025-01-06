import {
  postHostedIdentifySessionChallengeVerifyMutation,
  postHostedIdentifySessionVerifyMutation,
  postHostedOnboardingMutation,
} from '@onefootprint/axios';
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
    postHostedIdentifySessionChallengeVerifyMutation({
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
      {mutation.data && <StartOnboarding authToken={tokens.authToken} onDone={onDone} />}
    </Layout>
  );
};

const StartOnboarding = ({ authToken, onDone }: { authToken: string; onDone: (authToken: string) => void }) => {
  const verifySession = useMutation(
    postHostedIdentifySessionVerifyMutation({ headers: { 'X-Fp-Authorization': authToken } }),
  );
  const startOnboarding = useMutation(postHostedOnboardingMutation({ headers: { 'X-Fp-Authorization': authToken } }));

  const initOnboarding = async () => {
    const identifyData = await verifySession.mutateAsync({});
    const data = await startOnboarding.mutateAsync({
      body: { fixtureResult: 'pass' },
      headers: { 'X-Fp-Authorization': identifyData.authToken },
    });
    onDone(data.authToken);
  };

  useEffect(() => {
    initOnboarding();
  }, []);

  return null;
};

export default WaitingConfirmation;
