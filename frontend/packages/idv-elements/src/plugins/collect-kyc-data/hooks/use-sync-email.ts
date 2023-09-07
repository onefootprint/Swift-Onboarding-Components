import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';

import { useUserEmail } from '../../../hooks';

type SyncEmailArgs = {
  authToken?: string;
  email?: string;
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

    userEmailMutation.mutate(
      { data: { email }, authToken, speculative },
      {
        onSuccess,
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          console.error(
            'Failed email verification request from collect-kyc-data: ',
            getErrorMessage(error),
          );
          onError?.(error);
        },
      },
    );
  };

  return { mutation: userEmailMutation, syncEmail };
};

export default useSyncEmail;
