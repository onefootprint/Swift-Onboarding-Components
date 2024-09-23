import request from '@onefootprint/request';
import type { UploadFileRequest, UploadFileResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const uploadFileRequest = async (payload: UploadFileRequest) => {
  const { file, authToken, documentKind } = payload;
  const formData = new FormData();
  formData.append('file', file);

  const response = await request<UploadFileResponse>({
    method: 'POST',
    url: `/hosted/user/upload/${documentKind}`,
    data: formData,
    headers: {
      [AUTH_HEADER]: authToken,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

const useUploadFile = () => {
  return useMutation({
    mutationFn: uploadFileRequest,
  });
};

export default useUploadFile;
