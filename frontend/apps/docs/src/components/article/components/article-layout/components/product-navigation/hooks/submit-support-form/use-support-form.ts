import request, { RequestError } from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

import { SupportFormData } from '../../types';

export type SupportFormRequest = {
  data: SupportFormData;
  url: string;
};

const supportFormRequest = async ({ url, data }: SupportFormRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url,
    data,
    withCredentials: false,
  });
  return response.data;
};

const useSupportForm = () =>
  useMutation<{}, RequestError, SupportFormRequest>(supportFormRequest);

export default useSupportForm;
