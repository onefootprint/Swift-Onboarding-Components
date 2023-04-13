import { DataIdentifierKeys, DocumentDI } from '@onefootprint/types';
import get from 'lodash/get';

import { FormData } from '../../../../vault.types';
import { DiField } from '../../types';

const getDiFields = (fields: FormData) => {
  const result: DiField[] = [];
  DataIdentifierKeys.forEach(value => {
    const checked = get(fields, value);
    if (checked) {
      result.push(value);
    }
  });
  // TODO: This is not ideal. I'll make it more smart, so we won't try to decrypt
  // fields that we don't have in the user vault
  // https://linear.app/footprint/issue/FP-3544/only-decrypt-selfie-if-we-have-in-vault
  if (result.includes(DocumentDI.idCardFront)) {
    result.push(DocumentDI.idCardBack, DocumentDI.idCardSelfie);
  }
  if (result.includes(DocumentDI.driversLicenseFront)) {
    result.push(DocumentDI.driversLicenseBack, DocumentDI.driversLicenseSelfie);
  }
  if (result.includes(DocumentDI.passport)) {
    result.push(DocumentDI.passportSelfie);
  }
  return result;
};

export default getDiFields;
