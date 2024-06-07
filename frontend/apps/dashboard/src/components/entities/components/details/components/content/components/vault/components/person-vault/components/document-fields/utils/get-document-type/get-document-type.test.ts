import { DocumentDI, SupportedIdDocTypes } from '@onefootprint/types';

import getDocumentType from './get-document-type';

describe('getDocumentType', () => {
  it('should return correct DocumentType for drivers license', () => {
    expect(getDocumentType(DocumentDI.latestDriversLicenseFront)).toEqual(SupportedIdDocTypes.driversLicense);
    expect(getDocumentType(DocumentDI.driversLicenseRefNumber)).toEqual(SupportedIdDocTypes.driversLicense);
  });

  it('should return correct DocumentType for id card', () => {
    expect(getDocumentType(DocumentDI.latestIdCardFront)).toEqual(SupportedIdDocTypes.idCard);
    expect(getDocumentType(DocumentDI.idCardDOB)).toEqual(SupportedIdDocTypes.idCard);
  });

  it('should return correct DocumentType for passport', () => {
    expect(getDocumentType(DocumentDI.latestPassport)).toEqual(SupportedIdDocTypes.passport);
    expect(getDocumentType(DocumentDI.passportDOB)).toEqual(SupportedIdDocTypes.passport);
  });

  it('should return undefined for non ID doc case', () => {
    expect(getDocumentType(DocumentDI.finraComplianceLetter)).toEqual(undefined);
  });
});
