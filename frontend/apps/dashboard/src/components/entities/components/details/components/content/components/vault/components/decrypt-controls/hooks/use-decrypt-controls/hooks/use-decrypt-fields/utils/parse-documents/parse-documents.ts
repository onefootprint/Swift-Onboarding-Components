import type {
  DataIdentifier,
  VaultDocumentData,
  VaultValue,
} from '@onefootprint/types';
import { DocumentDI } from '@onefootprint/types';
import { base64StringToBlob } from 'blob-util';
import kebabCase from 'lodash/kebabCase';

type Output = Partial<Record<DocumentDI, VaultDocumentData>>;

const pdfs = [DocumentDI.finraComplianceLetter];

const parseDocuments = (
  input: Partial<Record<DataIdentifier, VaultValue>>,
): Output => {
  const output: Output = {};

  pdfs.forEach(async di => {
    const value = input[di];
    if (typeof value === 'string') {
      const blob = base64StringToBlob(value, 'application/pdf');
      output[di] = {
        name: kebabCase(di),
        content: new Blob([blob], {
          type: 'application/pdf',
        }),
      };
    }
  });
  return output;
};

export default parseDocuments;
