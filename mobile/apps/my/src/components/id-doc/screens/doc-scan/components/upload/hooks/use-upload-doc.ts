import request from '@onefootprint/request';
import { UploadDocRequest, UploadDocResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { AUTH_HEADER } from '@/config/constants';

const uploadDoc = async ({
  authToken,
  data,
  docId,
  meta,
  side,
}: UploadDocRequest) => {
  const response = await request<UploadDocResponse>({
    method: 'POST',
    url: `/hosted/user/documents/${docId}/upload/${side}`,
    data,
    headers: {
      [AUTH_HEADER]: authToken,
      'content-type': 'multipart/form-data',
      'x-fp-is-manual': meta.manual || false,
      'x-fp-is-app-clip': Platform.OS === 'ios',
      'x-fp-is-instant-app': Platform.OS === 'android',
      // 'x-fp-process-separately': true,
    },
    timeout: 180000,
  });

  return response.data;
};

const useUploadDoc = () =>
  useMutation(uploadDoc, {
    retry: 3,
  });

export default useUploadDoc;
