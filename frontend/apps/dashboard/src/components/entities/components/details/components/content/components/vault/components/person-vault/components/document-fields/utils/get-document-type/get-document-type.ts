import type { DocumentDI } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types';

// Given a primary DI (i.e. document.drivers_license.front.latest_upload)
// return the DocumentType (i.e. drivers_license)
const getDocumentType = (di: DocumentDI) => {
  const diArray = di.split('.');
  if (diArray.length < 2) {
    return undefined;
  }
  const docTypeString = diArray[1];

  if (docTypeString === SupportedIdDocTypes.driversLicense) {
    return SupportedIdDocTypes.driversLicense;
  }
  if (docTypeString === SupportedIdDocTypes.idCard) {
    return SupportedIdDocTypes.idCard;
  }
  if (docTypeString === SupportedIdDocTypes.passport) {
    return SupportedIdDocTypes.passport;
  }
  if (docTypeString === SupportedIdDocTypes.visa) {
    return SupportedIdDocTypes.visa;
  }
  if (docTypeString === SupportedIdDocTypes.residenceDocument) {
    return SupportedIdDocTypes.residenceDocument;
  }
  if (docTypeString === SupportedIdDocTypes.workPermit) {
    return SupportedIdDocTypes.workPermit;
  }
  if (docTypeString === SupportedIdDocTypes.voterIdentification) {
    return SupportedIdDocTypes.voterIdentification;
  }
  if (docTypeString === SupportedIdDocTypes.ssnCard) {
    return SupportedIdDocTypes.ssnCard;
  }
  if (docTypeString === SupportedIdDocTypes.lease) {
    return SupportedIdDocTypes.lease;
  }
  if (docTypeString === SupportedIdDocTypes.bankStatement) {
    return SupportedIdDocTypes.bankStatement;
  }
  if (docTypeString === SupportedIdDocTypes.utilityBill) {
    return SupportedIdDocTypes.utilityBill;
  }
  if (docTypeString === SupportedIdDocTypes.proofOfAddress) {
    return SupportedIdDocTypes.proofOfAddress;
  }
  if (docTypeString === SupportedIdDocTypes.passportCard) {
    return SupportedIdDocTypes.passportCard;
  }
  return undefined;
};

export default getDocumentType;
