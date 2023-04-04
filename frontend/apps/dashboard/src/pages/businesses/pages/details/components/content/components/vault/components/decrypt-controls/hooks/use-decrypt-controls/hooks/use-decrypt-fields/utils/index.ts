import {
  DecryptDocumentResponse,
  DecryptIdDocumentResponse,
  DecryptTextResponse,
  EntityVault,
  isVaultDataText,
} from '@onefootprint/types';
import unary from 'lodash/fp/unary';

type DecryptResponse =
  | DecryptIdDocumentResponse
  | DecryptTextResponse
  | DecryptDocumentResponse;

export const isTextResponse = (
  response: DecryptResponse,
): response is DecryptTextResponse => {
  if (typeof response !== 'object') return false;
  return Object.values(response).every(unary(isVaultDataText));
};

export const groupByType = (responses: DecryptResponse[]) => {
  const result = {
    text: {},
  };
  responses.forEach(response => {
    if (isTextResponse(response)) {
      result.text = { ...result.text, ...response };
    }
  });
  return result;
};

const transformToStoreInVault = (responseByType: {
  text: DecryptTextResponse;
}) => responseByType;

// TODO: Add support for Document and IDdocument
// https://linear.app/footprint/issue/FP-3364/vault-transformation-add-document-id-doc-support
export const parseResponseToVaultFormat = (
  responses: DecryptResponse[],
): EntityVault => {
  const responsesGroupedByType = groupByType(responses);
  const nextVaultData = transformToStoreInVault(responsesGroupedByType);
  return {
    ...nextVaultData.text,
  };
};
