import type { RequestError } from '@onefootprint/request';
import { getErrorMessage } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';

const useRequestErrorToast = () => {
  const toast = useToast();

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
