import { DocumentDI, SupportedIdDocTypes } from '@onefootprint/types';

// Given a primary DI (i.e. document.drivers_license.front.latest_upload)
// return the DocumentKind (i.e. drivers_license)
const getDocumentKind = (di: DocumentDI) => {
  if (di.includes(SupportedIdDocTypes.driversLicense)) {
    return SupportedIdDocTypes.driversLicense;
  }
  if (di.includes(SupportedIdDocTypes.idCard)) {
    return SupportedIdDocTypes.idCard;
  }
  if (di.includes(SupportedIdDocTypes.passport)) {
    return SupportedIdDocTypes.passport;
  }
  return undefined;
};

export default getDocumentKind;
