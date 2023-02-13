import { DecryptedIdDocStatus } from './decrypted-id-doc';
import IdDocType from './id-doc-type';

export type IdDocInfo = {
  type: IdDocType;
  status: DecryptedIdDocStatus;
  selfieCollected: boolean;
};
