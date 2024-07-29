import { baseRequest } from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

export type SupportFormData = {
  [FormField.name]: string;
  [FormField.email]: string;
  [FormField.message]: string;
};

export enum FormField {
  email = 'email',
  name = 'name',
  message = 'message',
}

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
