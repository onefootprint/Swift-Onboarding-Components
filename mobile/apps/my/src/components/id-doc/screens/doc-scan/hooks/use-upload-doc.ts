import request from '@onefootprint/request';
import { UploadDocRequest, UploadDocResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';

const uploadDoc = async ({
  authToken,
  docId,
  side,
  image,
  mimeType,
}: UploadDocRequest) => {
  const response = await request<UploadDocResponse>({
    method: 'POST',
    url: `/hosted/user/documents/${docId}/upload`,
    data: {
      image,
      side,
      mimeType,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useUploadDoc = ({ onError }: { onError: (error: unknown) => void }) =>
  useMutation(uploadDoc, { onError });

export default useUploadDoc;
