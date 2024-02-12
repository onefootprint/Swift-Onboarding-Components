import type { DocumentDI } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types';

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
    .replace(`document.${SupportedIdDocTypes.visa}.`, '')
    .replace(`document.${SupportedIdDocTypes.workPermit}.`, '')
    .replace(`document.${SupportedIdDocTypes.residenceDocument}.`, '')
    .replace(`document.${SupportedIdDocTypes.voterIdentification}.`, '')
    .replace(`document.${SupportedIdDocTypes.ssnCard}.`, '')
    .replace(`document.${SupportedIdDocTypes.lease}.`, '')
    .replace(`document.${SupportedIdDocTypes.bankStatement}.`, '')
    .replace(`document.${SupportedIdDocTypes.utilityBill}.`, '')
    .replace(`document.${SupportedIdDocTypes.proofOfAddress}.`, '')
    .replace(`document.${SupportedIdDocTypes.passportCard}.`, '')
    .replace(`:${activeDocumentVersion}`, '');

export default getDataLabel;
