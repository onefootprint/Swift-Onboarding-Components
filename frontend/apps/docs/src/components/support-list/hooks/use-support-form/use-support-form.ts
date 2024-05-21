import { baseRequest } from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

import type { SupportFormData } from '../../support-list.types';

export type SupportFormRequest = {
  data: SupportFormData;
  url: string;
};

const supportFormRequest = async ({ url, data }: SupportFormRequest) => {
  const response = await baseRequest({
    method: 'POST',
    url,
    data,
  });
  return response.data;
};

const useSupportForm = () => useMutation(supportFormRequest);

export default useSupportForm;
