import type { DecryptedIdDocStatus } from './decrypted-id-doc';
import type IdDocDI from './id-doc-data-attribute';

export type IdDocInfo = {
  // TODO: Remove from backend
  // https://linear.app/footprint/issue/FP-3235/remove-unused-fields-for-user
  // type: IdDocDI;
  dataIdentifier: IdDocDI;
  status: DecryptedIdDocStatus;
  selfieCollected: boolean;
};
