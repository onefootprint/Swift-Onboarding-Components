import { DecryptTextResponse, EntityVault } from '@onefootprint/types';

import groupResponsesByType from '../group-responses-by-type';
import parseStringifiedValues from '../parse-stringified-values';

type DecryptResponse = DecryptTextResponse;

// TODO: Add support for Document and IDdocument
// https://linear.app/footprint/issue/FP-3364/vault-transformation-add-document-id-doc-support
const transformResponseToVaultFormat = (
  responses: DecryptResponse[],
): EntityVault => {
  const { text } = groupResponsesByType(responses);
  return {
    ...parseStringifiedValues(text),
  };
};

export default transformResponseToVaultFormat;
