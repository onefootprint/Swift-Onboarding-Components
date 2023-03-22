import { DecryptedIdDoc, IdDocDI } from '../data';

export type DecryptIdDocumentRequest = {
  userId: string;
  // TODO: REMOVE
  // https://linear.app/footprint/issue/FP-3235/remove-unused-fields-for-user
  // documentType: IdDocType;
  documentIdentifier: IdDocDI;
  reason: string;
};

export type DecryptIdDocumentResponse = {
  // TODO: REMOVE
  // https://linear.app/footprint/issue/FP-3235/remove-unused-fields-for-user
  // documentType: IdDocType;
  documentIdentifier: IdDocDI;
  images: DecryptedIdDoc[];
};
