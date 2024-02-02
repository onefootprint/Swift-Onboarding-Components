import { getErrorMessage } from '@onefootprint/request';

import { useUserEmail } from '../../../hooks';
import useIdvRequestErrorToast from '../../../hooks/ui/use-idv-request-error-toast';
import Logger from '../../../utils/logger';

type SyncEmailArgs = {
  authToken?: string;
  email?: string;
  speculative?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const useSyncEmail = () => {
  const userEmailMutation = useUserEmail();
  const showRequestErrorToast = useIdvRequestErrorToast();

  const syncEmail = ({
    authToken,
    email,
    speculative,
    onSuccess,
    onError,
  }: SyncEmailArgs) => {
    if (!email) {
      Logger.error(
        'Found empty email while syncing email from collect-kyc-data.',
        'collect-kyc-data',
      );
      return;
    }
    if (!authToken) {
      Logger.error(
        'Found empty auth token while syncing email from collect-kyc-data.',
        'collect-kyc-data',
      );
      return;
    }

    if (userEmailMutation.isLoading) {
      return;
    }

    userEmailMutation.mutate(
      { data: { email }, authToken, speculative },
      {
        onSuccess,
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          Logger.error(
            `Failed email verification request from collect-kyc-data: ${getErrorMessage(
              error,
            )}`,
            'collect-kyc-data',
          );
          onError?.(error);
        },
      },
    );
  };

  return { mutation: userEmailMutation, syncEmail };
};

export default useSyncEmail;
