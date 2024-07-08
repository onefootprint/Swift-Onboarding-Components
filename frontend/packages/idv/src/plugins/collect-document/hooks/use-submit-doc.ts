import request from '@onefootprint/request';
import type { SubmitDocRequest, SubmitDocResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { t } from 'i18next';

const submitDoc = async (payload: SubmitDocRequest) => {
  const { authToken, image, side, id, meta, extraCompress, forceUpload } = payload;
  const formData = new FormData();
  formData.set('upload', image);
  const response = await request<SubmitDocResponse>({
    method: 'POST',
    url: `/hosted/documents/${id}/upload/${side}`,
    data: formData,
    headers: {
      [AUTH_HEADER]: authToken,
      'x-fp-is-extra-compressed': extraCompress, // This is used to check if the image is extra compressed due to bad connectivity
      'x-fp-is-manual': meta.manual || false, // This is used to check if it's a manual capture (not autocapture)
      'x-fp-is-app-clip': false, // This is used to check if it's an app clip
      'x-fp-is-instant-app': false, // This is used to check if it's instant app
      'Content-Type': 'multipart/form-data',
      'x-fp-is-upload': meta.isUpload, // This is used to differentiate between upload and capture
      'x-fp-force-upload': forceUpload, // This is used when the user had to upload instead of capturing because the camera is stuck
    },
    // Slightly higher than the server-side timeout.
    timeout: 61000,
    timeoutErrorMessage: t('request:errors.E121').toString(),
  });

  return response.data;
};

const useSubmitDoc = () => useMutation(submitDoc);

export default useSubmitDoc;
