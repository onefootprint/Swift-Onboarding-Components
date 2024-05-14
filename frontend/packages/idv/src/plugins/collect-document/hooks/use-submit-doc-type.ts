import request from '@onefootprint/request';
import type {
  SubmitDocTypeRequest,
  SubmitDocTypeResponse,
} from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const submitDocType = async (payload: SubmitDocTypeRequest) => {
  const {
    authToken,
    documentType,
    requestId,
    countryCode,
    fixtureResult,
    skipSelfie,
    deviceType,
  } = payload;
  const response = await request<SubmitDocTypeResponse>({
    method: 'POST',
    url: '/hosted/user/documents',
    data: {
      documentType,
      countryCode,
      requestId,
      fixtureResult,
      skipSelfie,
      deviceType,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useSubmitDocType = () => useMutation(submitDocType);

export default useSubmitDocType;
