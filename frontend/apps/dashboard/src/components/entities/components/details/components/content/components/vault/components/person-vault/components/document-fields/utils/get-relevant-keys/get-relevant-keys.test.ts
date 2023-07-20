import { DocumentDI, SupportedIdDocTypes } from '@onefootprint/types';

import getRelevantKeys from './get-relevant-keys';
import {
  entityVaultWithAllDocumentDIs,
  entityVaultWithJustDriverseLicenseDIs,
} from './get-relevant-keys.config';

describe('getRelevantKeys', () => {
  it('should filter only ID card DIs and not include selfie/front or back', () => {
    const relevantKeys = getRelevantKeys(
      entityVaultWithAllDocumentDIs,
      SupportedIdDocTypes.idCard,
    );
    expect(relevantKeys).toEqual([
      DocumentDI.idCardFullName,
      DocumentDI.idCardDOB,
      DocumentDI.idCardGender,
      DocumentDI.idCardFullAddress,
      DocumentDI.idCardDocumentNumber,
      DocumentDI.idCardIssuedAt,
      DocumentDI.idCardExpiresAt,
      DocumentDI.idCardIssuingState,
      DocumentDI.idCardIssuingCountry,
      DocumentDI.idCardRefNumber,
    ]);
  });

  it('should filter only drivers license DIs and not include selfie/front or back', () => {
    const relevantKeys = getRelevantKeys(
      entityVaultWithAllDocumentDIs,
      SupportedIdDocTypes.driversLicense,
    );
    expect(relevantKeys).toEqual([
      DocumentDI.driversLicenseFullName,
      DocumentDI.driversLicenseDOB,
      DocumentDI.driversLicenseGender,
      DocumentDI.driversLicenseFullAddress,
      DocumentDI.driversLicenseDocumentNumber,
      DocumentDI.driversLicenseIssuedAt,
      DocumentDI.driversLicenseExpiresAt,
      DocumentDI.driversLicenseIssuingState,
      DocumentDI.driversLicenseIssuingCountry,
      DocumentDI.driversLicenseRefNumber,
    ]);
  });

  it('should filter only passport DIs and not include selfie/front or back', () => {
    const relevantKeys = getRelevantKeys(
      entityVaultWithAllDocumentDIs,
      SupportedIdDocTypes.passport,
    );
    expect(relevantKeys).toEqual([
      DocumentDI.passportFullName,
      DocumentDI.passportDOB,
      DocumentDI.passportGender,
      DocumentDI.passportFullAddress,
      DocumentDI.passportDocumentNumber,
      DocumentDI.passportIssuedAt,
      DocumentDI.passportExpiresAt,
      DocumentDI.passportIssuingState,
      DocumentDI.passportIssuingCountry,
      DocumentDI.passportRefNumber,
    ]);
  });

  it('should return empty array when no keys overlap', () => {
    const relevantKeys = getRelevantKeys(
      entityVaultWithJustDriverseLicenseDIs,
      SupportedIdDocTypes.passport,
    );
    expect(relevantKeys).toEqual([]);
  });
});
