import { DecryptTextResponse, isVaultDataText } from '@onefootprint/types';
import unary from 'lodash/fp/unary';

type DecryptResponse = DecryptTextResponse;

export const isTextResponse = (
  response: DecryptResponse,
): response is DecryptTextResponse => {
  if (typeof response !== 'object') return false;
  return Object.values(response).every(unary(isVaultDataText));
};

const groupResponsesByType = (responses: DecryptResponse[]) => {
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

export default groupResponsesByType;
