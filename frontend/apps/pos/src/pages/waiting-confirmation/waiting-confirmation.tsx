import { postHostedIdentifyVerifyMutation } from '@onefootprint/axios';
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

  useEffect(() => {
    const pollVerification = () => {
      mutation.mutate(
        {
          body: {
            challengeResponse: null,
            challengeToken: tokens.challengeToken,
            scope: 'onboarding',
          },
        },
        {
          onSuccess: data => {
            if (data.authToken) {
              onDone(data.authToken);
            }
          },
        },
      );
    };

    // Initial check
    pollVerification();

    // // Set up polling interval
    // const interval = setInterval(pollVerification, 2000);

    // // Cleanup interval on unmount
    // return () => clearInterval(interval);
  }, []);

  return (
    <Layout onClose={onCancel}>
      <img src={logo} alt="Avis Logo" className="mx-auto mb-6" width={92} height={30} />
      <Header
        title="Waiting for customer..."
        subtitle="Text message sent to customer's phone number. Ask them to continue from their phone."
      />
      <LoadingSpinner className="mx-auto mb-4" />
    </Layout>
  );
};

export default WaitingConfirmation;
