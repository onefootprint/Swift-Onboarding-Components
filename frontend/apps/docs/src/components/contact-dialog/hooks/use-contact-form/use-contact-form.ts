import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

import type { ContactDialogData } from '../../contact-dialog.types';

export type ContactFormRequest = {
  data: ContactDialogData;
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
    { omitSessionId: true, omitClientVersion: true },
  );
  return response.data;
};

const useContactForm = () => useMutation(contactFormRequest);

export default useContactForm;
