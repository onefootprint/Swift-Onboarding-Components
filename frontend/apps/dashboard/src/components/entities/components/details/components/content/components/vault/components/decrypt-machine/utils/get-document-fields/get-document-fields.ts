import { DocumentDI } from '@onefootprint/types';
import get from 'lodash/get';

import { FormData } from '../../../../vault.types';

export const getDocumentFields = (fields: FormData) => {
  const result: DocumentDI[] = [];

  Object.values(DocumentDI).forEach(value => {
    // We need to use lodash get because react-hook-form transforms the data
    // to something like { document: { finra_compliance_letter: boolean } }
    const checked = get(fields, value);
    if (checked) {
      result.push(value);
    }
  });

  return result;
};

export default getDocumentFields;
