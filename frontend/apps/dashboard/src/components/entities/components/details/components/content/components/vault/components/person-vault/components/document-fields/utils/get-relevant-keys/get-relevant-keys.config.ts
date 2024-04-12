import type { EntityVault } from '@onefootprint/types';
import { DocumentDI } from '@onefootprint/types';

const entityVaultWithJustIDCardDIs: EntityVault = {
  [`${DocumentDI.latestIdCardFront}:567`]: 'test ID URL',
  [`${DocumentDI.latestIdCardBack}:568`]: 'test ID URL',
  [`${DocumentDI.latestIdCardSelfie}:569`]: 'test ID URL',
  [`${DocumentDI.idCardFullName}`]: 'test ID full name',
  [`${DocumentDI.idCardDOB}`]: 'test ID DOB',
  [`${DocumentDI.idCardGender}`]: 'test id card gender',
  [`${DocumentDI.idCardFullAddress}`]: 'test id card full address',
  [`${DocumentDI.idCardDocumentNumber}`]: 'test id card document number',
  [`${DocumentDI.idCardIssuedAt}`]: 'test id card issued at',
  [`${DocumentDI.idCardExpiresAt}`]: 'test id card expires at',
  [`${DocumentDI.idCardIssuingState}`]: 'test id card issuing state',
  [`${DocumentDI.idCardIssuingCountry}`]: 'test id card issuing country',
  [`${DocumentDI.idCardRefNumber}`]: 'test id card ref number',
};

export const driversLicenseExtractedDIs: EntityVault = {
  [`${DocumentDI.driversLicenseFullName}`]: 'test drivers license full name',
  [`${DocumentDI.driversLicenseDOB}`]: 'test drivers license DOB',
  [`${DocumentDI.driversLicenseGender}`]: 'test drivers license gender',
  [`${DocumentDI.driversLicenseFullAddress}`]:
    'test drivers license full address',
  [`${DocumentDI.driversLicenseDocumentNumber}`]:
    'test drivers license document number',
  [`${DocumentDI.driversLicenseIssuedAt}`]: 'test drivers license issued at',
  [`${DocumentDI.driversLicenseExpiresAt}`]: 'test drivers license expires at',
  [`${DocumentDI.driversLicenseIssuingState}`]:
    'test drivers license issuing state',
  [`${DocumentDI.driversLicenseIssuingCountry}`]:
    'test drivers license issuing country',
  [`${DocumentDI.driversLicenseRefNumber}`]: 'test drivers license ref number',
};

export const entityVaultWithJustDriverseLicenseDIs: EntityVault = {
  [`${DocumentDI.latestDriversLicenseFront}:450`]: 'test drivers license front',
  [`${DocumentDI.latestDriversLicenseBack}:460`]: 'test drivers license back',
  [`${DocumentDI.latestDriversLicenseSelfie}:470`]:
    'test drivers license selfie',
  ...driversLicenseExtractedDIs,
};

const entityVaultWithJustPassportDIs: EntityVault = {
  [`${DocumentDI.latestPassport}:787`]: 'test passport',
  [`${DocumentDI.latestPassportSelfie}:788`]: 'test passport selfie',
  [`${DocumentDI.passportFullName}`]: 'test passport full name',
  [`${DocumentDI.passportDOB}`]: 'test passport DOB',
  [`${DocumentDI.passportGender}`]: 'test passport gender',
  [`${DocumentDI.passportFullAddress}`]: 'test passport full address',
  [`${DocumentDI.passportDocumentNumber}`]: 'test passport document number',
  [`${DocumentDI.passportIssuedAt}`]: 'test passport issued at',
  [`${DocumentDI.passportExpiresAt}`]: 'test passport expires at',
  [`${DocumentDI.passportIssuingState}`]: 'test passport issuing state',
  [`${DocumentDI.passportIssuingCountry}`]: 'test passport issuing country',
  [`${DocumentDI.passportRefNumber}`]: 'test passport ref number',
};

export const entityVaultWithAllDocumentDIs: EntityVault = {
  ...entityVaultWithJustIDCardDIs,
  ...entityVaultWithJustDriverseLicenseDIs,
  ...entityVaultWithJustPassportDIs,
};
