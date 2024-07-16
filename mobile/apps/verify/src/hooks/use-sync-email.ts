import useRequestErrorToast from './use-request-error-toast';
import useUserEmail from './use-user-email';

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

  const syncEmail = ({ authToken, email, speculative, onSuccess, onError }: SyncEmailArgs) => {
    if (!email || !authToken || userEmailMutation.isLoading) {
      return;
    }

    userEmailMutation.mutate(
      { data: { email }, authToken, speculative },
      {
        onSuccess,
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          onError?.(error);
        },
      },
    );
  };

  return { mutation: userEmailMutation, syncEmail };
};

export default useSyncEmail;
