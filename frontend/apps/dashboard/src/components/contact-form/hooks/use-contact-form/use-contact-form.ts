import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

import type { ContactFormData } from '../../contact-form.types';

export type ContactFormRequest = {
  data: ContactFormData;
  url: string;
};

const contactFormRequest = async ({ url, data }: ContactFormRequest) => {
  const response = await request(
    {
      method: 'POST',
      url,
      data,
      withCredentials: false,
    },
    true,
  );
  return response.data;
};

const useContactForm = () => useMutation(contactFormRequest);

export default useContactForm;
