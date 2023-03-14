import { useRequestErrorToast } from '@onefootprint/hooks';

import { useUserEmail } from '../../../hooks';

type SyncEmailArgs = {
  authToken?: string;
  email?: string;
  sandboxSuffix?: string;
  speculative?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const useSyncEmail = () => {
  const userEmailMutation = useUserEmail();
  const showRequestErrorToast = useRequestErrorToast();

  const syncEmail = ({
    authToken,
    email,
    sandboxSuffix,
    speculative,
    onSuccess,
    onError,
  }: SyncEmailArgs) => {
    if (!email) {
      console.error(
        'Found empty email while syncing email from collect-kyc-data.',
      );
      return;
    }
    if (!authToken) {
      console.error(
        'Found empty auth token while syncing email from collect-kyc-data.',
      );
      return;
    }

    // If we are in sandbox mode, attach the sandbox suffix to the email
    const emailWithSuffix = sandboxSuffix ? `${email}${sandboxSuffix}` : email;
    userEmailMutation.mutate(
      { data: { email: emailWithSuffix }, authToken, speculative },
      {
        onSuccess,
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          console.error(
            'Failed email verification request from collect-kyc-data: ',
            error,
          );
          onError?.(error);
        },
      },
    );
  };

  return { mutation: userEmailMutation, syncEmail };
};

export default useSyncEmail;
