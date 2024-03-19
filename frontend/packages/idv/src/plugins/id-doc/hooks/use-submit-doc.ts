import request from '@onefootprint/request';
import type { SubmitDocRequest, SubmitDocResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { t } from 'i18next';

const submitDoc = async (payload: SubmitDocRequest) => {
  const { authToken, image, side, id, meta, extraCompress } = payload;
  const formData = new FormData();
  formData.set('upload', image);
  const response = await request<SubmitDocResponse>({
    method: 'POST',
    url: `/hosted/user/documents/${id}/upload/${side}`,
    data: formData,
    headers: {
      [AUTH_HEADER]: authToken,
      'x-fp-is-extra-compressed': extraCompress,
      'x-fp-is-manual': meta.manual || false,
      'x-fp-is-app-clip': false,
      'x-fp-is-instant-app': false,
      'Content-Type': 'multipart/form-data',
      'x-fp-process-separately': true,
      'x-fp-is-upload': meta.isUpload,
    },
    // Slightly higher than the server-side timeout.
    timeout: 61000,
    timeoutErrorMessage: t('request:errors.E121').toString(),
  });

  return response.data;
};

const useSubmitDoc = () => useMutation(submitDoc);

export default useSubmitDoc;
