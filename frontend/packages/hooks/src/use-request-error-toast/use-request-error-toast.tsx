import type { RequestError } from '@onefootprint/request';
import { useRequestError } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';

const useRequestErrorToast = () => {
  const toast = useToast();
  const { getErrorMessage } = useRequestError();

  const notify = (error?: RequestError | unknown) => {
    toast.show({
      description: getErrorMessage(error),
      title: 'Uh-oh!',
      variant: 'error',
    });
  };

  return notify;
};

export default useRequestErrorToast;
