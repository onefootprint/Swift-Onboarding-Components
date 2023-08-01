import { CollectedDocumentDataOption } from '@onefootprint/types';

import extractIdDocTypesFromCdo from './utils/extract-id-doc-types-from-cdo';

const isDocumentDi = (cdo: string) => cdo.startsWith('document');
const isDocumentAndSelfieDi = (cdo: string) =>
  isDocumentDi(cdo) && cdo.indexOf('selfie') > -1;

const getCdos = (cdos: string[]) => {
  const documentCdos: string[] = [];
  const otherCdos: string[] = [];
  cdos.forEach(cdo => {
    if (isDocumentDi(cdo)) {
      documentCdos.push(cdo);
    } else {
      otherCdos.push(cdo);
    }
  });

  const compositeDocumentCdos = documentCdos.filter(
    cdo =>
      cdo.startsWith('document') &&
      cdo !== CollectedDocumentDataOption.documentAndSelfie &&
      cdo !== CollectedDocumentDataOption.document,
  );

  const processedDocumentCdos: string[] = [];
  if (documentCdos.includes(CollectedDocumentDataOption.documentAndSelfie)) {
    if (compositeDocumentCdos.length === 0) {
      processedDocumentCdos.push(CollectedDocumentDataOption.documentAndSelfie);
    }
  }

  compositeDocumentCdos.forEach(cdo => {
    processedDocumentCdos.push(...extractIdDocTypesFromCdo(cdo));
    if (isDocumentAndSelfieDi(cdo)) {
      processedDocumentCdos.push('selfie');
    }
  });
  const allCdos = Array.from(new Set([...otherCdos, ...processedDocumentCdos]));

  return allCdos;
};

export default getCdos;
