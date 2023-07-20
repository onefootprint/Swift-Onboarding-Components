import { DocumentDI, SupportedIdDocTypes } from '@onefootprint/types';

import getDocumentKind from './get-document-kind';

describe('getDocumentKind', () => {
  it('should return correct DocumentKind for drivers license', () => {
    expect(getDocumentKind(DocumentDI.latestDriversLicenseFront)).toEqual(
      SupportedIdDocTypes.driversLicense,
    );
    expect(getDocumentKind(DocumentDI.driversLicenseRefNumber)).toEqual(
      SupportedIdDocTypes.driversLicense,
    );
  });

  it('should return correct DocumentKind for id card', () => {
    expect(getDocumentKind(DocumentDI.latestIdCardFront)).toEqual(
      SupportedIdDocTypes.idCard,
    );
    expect(getDocumentKind(DocumentDI.idCardDOB)).toEqual(
      SupportedIdDocTypes.idCard,
    );
  });

  it('should return correct DocumentKind for passport', () => {
    expect(getDocumentKind(DocumentDI.latestPassport)).toEqual(
      SupportedIdDocTypes.passport,
    );
    expect(getDocumentKind(DocumentDI.passportDOB)).toEqual(
      SupportedIdDocTypes.passport,
    );
  });

  it('should return undefined for non ID doc case', () => {
    expect(getDocumentKind(DocumentDI.finraComplianceLetter)).toEqual(
      undefined,
    );
  });
});
