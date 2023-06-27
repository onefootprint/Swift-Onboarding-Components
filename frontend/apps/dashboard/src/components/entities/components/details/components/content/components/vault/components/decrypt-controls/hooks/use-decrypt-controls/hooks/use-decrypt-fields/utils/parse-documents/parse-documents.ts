import type {
  DataIdentifier,
  VaultDocumentData,
  VaultImageData,
  VaultValue,
} from '@onefootprint/types';
import { DocumentDI } from '@onefootprint/types';
import { base64StringToBlob } from 'blob-util';
import kebabCase from 'lodash/kebabCase';

type Output = Partial<Record<DocumentDI, VaultDocumentData | VaultImageData>>;

const pdfs = [DocumentDI.finraComplianceLetter];
const images = [
  DocumentDI.latestDriversLicenseBack,
  DocumentDI.latestDriversLicenseFront,
  DocumentDI.latestDriversLicenseSelfie,
  DocumentDI.latestIdCardBack,
  DocumentDI.latestIdCardFront,
  DocumentDI.latestIdCardSelfie,
  DocumentDI.latestPassport,
  DocumentDI.latestPassportSelfie,
];

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
  images.forEach(async di => {
    const value = input[di];
    if (typeof value === 'string') {
      output[di] = {
        name: kebabCase(di),
        src: `data:image/jpg;base64,${value}`,
      };
    }
  });
  return output;
};

export default parseDocuments;
