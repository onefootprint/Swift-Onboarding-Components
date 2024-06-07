import type { DecryptResponse, EntityVault } from '@onefootprint/types';

import parseDocumentsRawOcrJson from '../../use-decrypt-controls/hooks/use-decrypt-fields/utils/parse-documents-raw-ocr-json';
import parseStringifiedValues from '../../use-decrypt-controls/hooks/use-decrypt-fields/utils/parse-stringified-values';

const transformResponseToVaultFormat = (response: DecryptResponse): EntityVault => {
  const documents = parseDocumentsRawOcrJson(response);
  const text = parseStringifiedValues(response);
  return { ...text, ...documents };
};

export default transformResponseToVaultFormat;
