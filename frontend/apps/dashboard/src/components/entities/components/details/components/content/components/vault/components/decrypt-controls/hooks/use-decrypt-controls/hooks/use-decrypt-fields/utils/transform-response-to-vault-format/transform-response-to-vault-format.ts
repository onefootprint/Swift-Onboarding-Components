import { DecryptResponse, EntityVault } from '@onefootprint/types';

// import groupResponsesByType from '../group-responses-by-type';
import parseStringifiedValues from '../parse-stringified-values';

const transformResponseToVaultFormat = (
  response: DecryptResponse,
): EntityVault => ({
  ...parseStringifiedValues(response),
});

export default transformResponseToVaultFormat;
