import type { DocumentDI } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types';

// Given a primary DI (i.e. document.drivers_license.front.latest_upload)
// return the DocumentType (i.e. drivers_license)
const getDocumentType = (di: DocumentDI) => {
  if (di.includes(SupportedIdDocTypes.driversLicense)) {
    return SupportedIdDocTypes.driversLicense;
  }
  if (di.includes(SupportedIdDocTypes.idCard)) {
    return SupportedIdDocTypes.idCard;
  }
  if (di.includes(SupportedIdDocTypes.passport)) {
    return SupportedIdDocTypes.passport;
  }
  if (di.includes(SupportedIdDocTypes.visa)) {
    return SupportedIdDocTypes.visa;
  }
  if (di.includes(SupportedIdDocTypes.residenceDocument)) {
    return SupportedIdDocTypes.residenceDocument;
  }
  if (di.includes(SupportedIdDocTypes.workPermit)) {
    return SupportedIdDocTypes.workPermit;
  }
  return undefined;
};

export default getDocumentType;
