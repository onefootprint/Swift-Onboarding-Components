import type { EntityVault } from '@onefootprint/types';
import { DocumentDI } from '@onefootprint/types';

const entityVaultWithJustIDCardDIs: EntityVault = {
  [`${DocumentDI.latestIdCardFront}:675`]: 'test ID URL',
  [`${DocumentDI.latestIdCardBack}:676`]: 'test ID URL',
  [`${DocumentDI.latestIdCardSelfie}:677`]: 'test ID URL',
  [`${DocumentDI.idCardFullName}:123`]: 'test ID full name',
  [`${DocumentDI.idCardGender}:123`]: 'test id card gender',
  [`${DocumentDI.idCardFullAddress}:123`]: 'test id card full address',
  [`${DocumentDI.idCardDocumentNumber}:123`]: 'test id card document number',
  [`${DocumentDI.idCardIssuingState}:123`]: 'test id card issuing state',
  [`${DocumentDI.idCardIssuingCountry}:123`]: 'test id card issuing country',
  [`${DocumentDI.idCardRefNumber}:123`]: 'test id card ref number',
  [`${DocumentDI.idCardDOB}:123`]: '1990-04-15',
  [`${DocumentDI.idCardIssuedAt}:123`]: '2020-04-23',
  [`${DocumentDI.idCardExpiresAt}:123`]: '2025-12-31',
};

export const driversLicensePartialDIs: EntityVault = {
  [`${DocumentDI.driversLicenseFullName}:456`]: 'test drivers license full name',
  [`${DocumentDI.driversLicenseDOB}:456`]: '1990-04-15',
  [`${DocumentDI.driversLicenseGender}:456`]: 'test drivers license gender',
};

export const driversLicenseExtractedDIs: EntityVault = {
  [`${DocumentDI.driversLicenseFullName}:456`]: 'test drivers license full name',
  [`${DocumentDI.driversLicenseGender}:456`]: 'test drivers license gender',
  [`${DocumentDI.driversLicenseFullAddress}:456`]: 'test drivers license full address',
  [`${DocumentDI.driversLicenseDocumentNumber}:456`]: 'test drivers license document number',
  [`${DocumentDI.driversLicenseIssuingState}:456`]: 'test drivers license issuing state',
  [`${DocumentDI.driversLicenseIssuingCountry}:456`]: 'test drivers license issuing country',
  [`${DocumentDI.driversLicenseRefNumber}:456`]: 'test drivers license ref number',
  [`${DocumentDI.driversLicenseDOB}:456`]: '1992-06-15',
  [`${DocumentDI.driversLicenseIssuedAt}:456`]: '2021-01-15',
  [`${DocumentDI.driversLicenseExpiresAt}:456`]: '2026-01-15',
};

export const entityVaultWithJustDriverseLicenseDIs: EntityVault = {
  ...driversLicenseExtractedDIs,
  [`${DocumentDI.latestDriversLicenseFront}:1738`]: 'test drivers license front',
  [`${DocumentDI.latestDriversLicenseBack}:1738`]: 'test drivers license back',
  [`${DocumentDI.latestDriversLicenseSelfie}:1738`]: 'test drivers license selfie',
};

const entityVaultWithJustPassportDIs: EntityVault = {
  [`${DocumentDI.latestPassport}:679`]: 'test passport URL',
  [`${DocumentDI.latestPassportSelfie}:679`]: 'test passport URL',
  [`${DocumentDI.passportFullName}:679`]: 'test passport full name',
  [`${DocumentDI.passportGender}:679`]: 'test passport gender',
  [`${DocumentDI.passportFullAddress}:679`]: 'test passport full address',
  [`${DocumentDI.passportDocumentNumber}:679`]: 'test passport document number',
  [`${DocumentDI.passportIssuingState}:679`]: 'test passport issuing state',
  [`${DocumentDI.passportIssuingCountry}:679`]: 'test passport issuing country',
  [`${DocumentDI.passportRefNumber}:679`]: 'test passport ref number',
  [`${DocumentDI.passportDOB}:679`]: '1988-03-03',
  [`${DocumentDI.passportIssuedAt}:679`]: '2019-08-20',
  [`${DocumentDI.passportExpiresAt}:679`]: '2029-08-20',
};

export const entityVaultWithAllDocumentDIs: EntityVault = {
  ...entityVaultWithJustIDCardDIs,
  ...entityVaultWithJustDriverseLicenseDIs,
  ...entityVaultWithJustPassportDIs,
};
