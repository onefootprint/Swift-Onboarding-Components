import { baseRequest } from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

import type { ContactDialogData } from '../../contact-dialog.types';

export type ContactFormRequest = {
  data: ContactDialogData;
  url: string;
};

const contactFormRequest = async ({ url, data }: ContactFormRequest) => {
  const response = await baseRequest({
    method: 'POST',
    url,
    data,
  });
  return response.data;
};

const useContactForm = () => useMutation(contactFormRequest);

export default useContactForm;
