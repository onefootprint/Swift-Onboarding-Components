import { postHostedOnboardingAvisResultMutation } from '@onefootprint/axios';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import IcoCheckCircle40 from '../../components/icons/ico-check-circle-40';
import IcoClose40 from '../../components/icons/ico-close-40';
import Layout from '../../components/layout';
import LoadingSpinner from '../../components/ui/loading-spinner';

type ResultStepProps = {
  authToken: string;
};

const ResultStep = ({ authToken }: ResultStepProps) => {
  const mutation = useMutation(
    postHostedOnboardingAvisResultMutation({
      headers: { 'X-Fp-Authorization': authToken },
    }),
  );

  useEffect(() => {
    mutation.mutate({
      body: {},
    });
  }, []);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center">
        {mutation.isPending && <LoadingSpinner />}
        {mutation.isSuccess && (
          <>
            {mutation.data.status === 'pass' && (
              <>
                <IcoCheckCircle40 fill="#0a6a4a" />
                <h1 className="text-heading-3 text-success mb-2 mt-4">Approved</h1>
                <p className="text-body-2 text-primary">They're all set.</p>
              </>
            )}
            {mutation.data.status === 'fail' && (
              <>
                <IcoClose40 fill="#991008" />
                <h1 className="text-heading-3 text-error mb-2 mt-4">Not approved</h1>
                <p className="text-body-2 text-primary">Person was not approved to rent.</p>
              </>
            )}
          </>
        )}
        {mutation.isError && <h1 className="text-heading-3 text-error mb-2 mt-4">Something went wrong</h1>}
      </div>
    </Layout>
  );
};

export default ResultStep;
