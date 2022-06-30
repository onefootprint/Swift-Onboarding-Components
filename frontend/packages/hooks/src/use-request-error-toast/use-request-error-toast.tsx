import { getErrorMessage, RequestError } from 'request';
import { useToast } from 'ui';

const useRequestErrorToast = () => {
  const toast = useToast();

  const notify = (error: RequestError) => {
    toast.show({
      description: getErrorMessage(error),
      title: 'Uh-oh!',
      variant: 'error',
    });
  };

  return notify;
};

export default useRequestErrorToast;
