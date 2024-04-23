import { DocumentDI, SupportedIdDocTypes } from '@onefootprint/types';

import getRelevantKeys from './get-relevant-keys';
import {
  entityVaultWithAllDocumentDIs,
  entityVaultWithJustDriverseLicenseDIs,
  entityVaultWithMultipleVersionsOfPassportDIs,
} from './get-relevant-keys.test.config';

describe('getRelevantKeys', () => {
  it('should filter only ID card DIs and not include selfie/front or back', () => {
    const relevantKeys = getRelevantKeys({
      vault: entityVaultWithAllDocumentDIs,
      documentType: SupportedIdDocTypes.idCard,
      currentDocumentNumber: '1243',
    });
    expect(relevantKeys).toEqual([
      `${DocumentDI.idCardFullName}:1243`,
      `${DocumentDI.idCardDOB}:1243`,
      `${DocumentDI.idCardGender}:1243`,
      `${DocumentDI.idCardFullAddress}:1243`,
      `${DocumentDI.idCardDocumentNumber}:1243`,
      `${DocumentDI.idCardIssuedAt}:1243`,
      `${DocumentDI.idCardExpiresAt}:1243`,
      `${DocumentDI.idCardIssuingState}:1243`,
      `${DocumentDI.idCardIssuingCountry}:1243`,
      `${DocumentDI.idCardRefNumber}:1243`,
    ]);
  });

  it('should filter only drivers license DIs and not include selfie/front or back', () => {
    const relevantKeys = getRelevantKeys({
      vault: entityVaultWithAllDocumentDIs,
      documentType: SupportedIdDocTypes.driversLicense,
      currentDocumentNumber: '345',
    });
    expect(relevantKeys).toEqual([
      `${DocumentDI.driversLicenseFullName}:345`,
      `${DocumentDI.driversLicenseDOB}:345`,
      `${DocumentDI.driversLicenseGender}:345`,
      `${DocumentDI.driversLicenseFullAddress}:345`,
      `${DocumentDI.driversLicenseDocumentNumber}:345`,
      `${DocumentDI.driversLicenseIssuedAt}:345`,
      `${DocumentDI.driversLicenseExpiresAt}:345`,
      `${DocumentDI.driversLicenseIssuingState}:345`,
      `${DocumentDI.driversLicenseIssuingCountry}:345`,
      `${DocumentDI.driversLicenseRefNumber}:345`,
    ]);
  });

  it('should filter only passport DIs and not include selfie/front or back', () => {
    const relevantKeys = getRelevantKeys({
      vault: entityVaultWithAllDocumentDIs,
      documentType: SupportedIdDocTypes.passport,
      currentDocumentNumber: '1738',
    });
    expect(relevantKeys).toEqual([
      `${DocumentDI.passportFullName}:1738`,
      `${DocumentDI.passportDOB}:1738`,
      `${DocumentDI.passportGender}:1738`,
      `${DocumentDI.passportFullAddress}:1738`,
      `${DocumentDI.passportDocumentNumber}:1738`,
      `${DocumentDI.passportIssuedAt}:1738`,
      `${DocumentDI.passportExpiresAt}:1738`,
      `${DocumentDI.passportIssuingState}:1738`,
      `${DocumentDI.passportIssuingCountry}:1738`,
      `${DocumentDI.passportRefNumber}:1738`,
    ]);
  });

  it('should return empty array when no keys overlap', () => {
    const relevantKeys = getRelevantKeys({
      vault: entityVaultWithJustDriverseLicenseDIs,
      documentType: SupportedIdDocTypes.passport,
      currentDocumentNumber: '123',
    });
    expect(relevantKeys).toEqual([]);
  });

  it('should only return correct version of keys for single DI when multiple exist', () => {
    const relevantKeys1738 = getRelevantKeys({
      vault: entityVaultWithMultipleVersionsOfPassportDIs,
      documentType: SupportedIdDocTypes.passport,
      currentDocumentNumber: '1738',
    });
    expect(relevantKeys1738).toEqual([
      `${DocumentDI.passportFullName}:1738`,
      `${DocumentDI.passportDOB}:1738`,
      `${DocumentDI.passportGender}:1738`,
      `${DocumentDI.passportFullAddress}:1738`,
      `${DocumentDI.passportDocumentNumber}:1738`,
      `${DocumentDI.passportIssuedAt}:1738`,
      `${DocumentDI.passportExpiresAt}:1738`,
      `${DocumentDI.passportIssuingState}:1738`,
      `${DocumentDI.passportIssuingCountry}:1738`,
      `${DocumentDI.passportRefNumber}:1738`,
    ]);
    const relevantKeys2048 = getRelevantKeys({
      vault: entityVaultWithMultipleVersionsOfPassportDIs,
      documentType: SupportedIdDocTypes.passport,
      currentDocumentNumber: '2048',
    });
    expect(relevantKeys2048).toEqual([
      `${DocumentDI.passportFullName}:2048`,
      `${DocumentDI.passportDOB}:2048`,
      `${DocumentDI.passportGender}:2048`,
      `${DocumentDI.passportFullAddress}:2048`,
      `${DocumentDI.passportDocumentNumber}:2048`,
      `${DocumentDI.passportIssuedAt}:2048`,
      `${DocumentDI.passportExpiresAt}:2048`,
      `${DocumentDI.passportIssuingState}:2048`,
      `${DocumentDI.passportIssuingCountry}:2048`,
      `${DocumentDI.passportRefNumber}:2048`,
    ]);
  });
});
