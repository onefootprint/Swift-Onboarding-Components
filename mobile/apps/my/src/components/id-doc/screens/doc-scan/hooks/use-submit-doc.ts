import request from '@onefootprint/request';
import {
  IdDocType,
  SubmitDocRequest,
  SubmitDocResponse,
  SubmitDocumentSide,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER, REVIEW_AUTH_TOKEN } from '@/config/constants';

const submitDoc = async (payload: SubmitDocRequest) => {
  const {
    authToken,
    frontImage,
    backImage,
    selfieImage,
    documentType,
    countryCode,
  } = payload;
  if (authToken === REVIEW_AUTH_TOKEN) {
    if (frontImage) {
      return {
        errors: [],
        nextSideToCollect:
          documentType === IdDocType.passport
            ? SubmitDocumentSide.Selfie
            : SubmitDocumentSide.Back,
        isRetryLimitExceeded: false,
      };
    }
    if (backImage) {
      return {
        errors: [],
        nextSideToCollect: SubmitDocumentSide.Selfie,
        isRetryLimitExceeded: false,
      };
    }
    if (selfieImage) {
      return {
        errors: [],
        nextSideToCollect: null,
        isRetryLimitExceeded: false,
      };
    }
  }

  const response = await request<SubmitDocResponse>({
    method: 'POST',
    url: '/hosted/user/document',
    data: {
      frontImage,
      backImage,
      selfieImage,
      documentType,
      countryCode,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useSubmitDoc = ({ onError }: { onError: (error: unknown) => void }) =>
  useMutation(submitDoc, { onError });

export default useSubmitDoc;
