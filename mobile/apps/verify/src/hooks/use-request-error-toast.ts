import type { RequestError } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';

import useRequestError from './use-request-error';

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
