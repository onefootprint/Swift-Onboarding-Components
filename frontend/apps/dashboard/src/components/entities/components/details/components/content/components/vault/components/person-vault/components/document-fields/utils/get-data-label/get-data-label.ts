import { DocumentDI, SupportedIdDocTypes } from '@onefootprint/types';

// All of our data labels are based on DI suffixes (i.e. dob, full_name, etc).
// This function genericizes them so we can use one translation for drivers license, passport, and ID card.
const getDataLabel = (
  key: DocumentDI | string,
  activeDocumentVersion: string,
) =>
  key
    .replace(`document.${SupportedIdDocTypes.driversLicense}.`, '')
    .replace(`document.${SupportedIdDocTypes.passport}.`, '')
    .replace(`document.${SupportedIdDocTypes.idCard}.`, '')
    .replace(`:${activeDocumentVersion}`, '');

export default getDataLabel;
