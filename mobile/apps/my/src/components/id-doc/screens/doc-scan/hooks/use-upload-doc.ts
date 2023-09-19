import request from '@onefootprint/request';
import { UploadDocRequest, UploadDocResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { AUTH_HEADER } from '@/config/constants';

const uploadDoc = async ({
  authToken,
  docId,
  side,
  image,
  mimeType,
  meta,
}: UploadDocRequest) => {
  const response = await request<UploadDocResponse>({
    method: 'POST',
    url: `/hosted/user/documents/${docId}/upload`,
    data: {
      image,
      side,
      mimeType,
      meta: {
        ...meta,
        isAppClip: Platform.OS === 'ios',
        isInstantApp: Platform.OS === 'android',
      },
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useUploadDoc = () => useMutation(uploadDoc);

export default useUploadDoc;
