import type { DecryptResponse, EntityVault } from '@onefootprint/types';

import parseDocuments from '../../use-decrypt-controls/hooks/use-decrypt-fields/utils/parse-documents';
import parseStringifiedValues from '../../use-decrypt-controls/hooks/use-decrypt-fields/utils/parse-stringified-values';

const transformResponseToVaultFormat = (
  response: DecryptResponse,
): EntityVault => {
  const documents = parseDocuments(response);
  const text = parseStringifiedValues(response);
  return { ...text, ...documents };
};

export default transformResponseToVaultFormat;
