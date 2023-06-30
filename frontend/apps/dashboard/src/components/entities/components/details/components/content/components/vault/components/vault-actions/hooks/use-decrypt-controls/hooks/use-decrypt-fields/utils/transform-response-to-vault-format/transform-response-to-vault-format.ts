import { DecryptResponse, EntityVault } from '@onefootprint/types';

import parseDocuments from '../parse-documents';
import parseStringifiedValues from '../parse-stringified-values';

const transformResponseToVaultFormat = (
  response: DecryptResponse,
): EntityVault => {
  const documents = parseDocuments(response);
  const text = parseStringifiedValues(response);
  return { ...text, ...documents };
};

export default transformResponseToVaultFormat;
