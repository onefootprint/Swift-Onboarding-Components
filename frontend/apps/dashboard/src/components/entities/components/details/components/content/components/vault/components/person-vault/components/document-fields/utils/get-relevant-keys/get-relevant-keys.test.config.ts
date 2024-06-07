import type { EntityVault } from '@onefootprint/types';
import { DocumentDI } from '@onefootprint/types';

const entityVaultWithJustIDCardDIs: EntityVault = {
  [`${DocumentDI.latestIdCardFront}:567`]: 'test ID URL',
  [`${DocumentDI.latestIdCardBack}:568`]: 'test ID URL',
  [`${DocumentDI.latestIdCardSelfie}:569`]: 'test ID URL',
  [`${DocumentDI.idCardFullName}:1243`]: 'test ID full name',
  [`${DocumentDI.idCardDOB}:1243`]: 'test ID DOB',
  [`${DocumentDI.idCardGender}:1243`]: 'test id card gender',
  [`${DocumentDI.idCardFullAddress}:1243`]: 'test id card full address',
  [`${DocumentDI.idCardDocumentNumber}:1243`]: 'test id card document number',
  [`${DocumentDI.idCardIssuedAt}:1243`]: 'test id card issued at',
  [`${DocumentDI.idCardExpiresAt}:1243`]: 'test id card expires at',
  [`${DocumentDI.idCardIssuingState}:1243`]: 'test id card issuing state',
  [`${DocumentDI.idCardIssuingCountry}:1243`]: 'test id card issuing country',
  [`${DocumentDI.idCardRefNumber}:1243`]: 'test id card ref number',
};

export const driversLicenseExtractedDIs: EntityVault = {
  [`${DocumentDI.driversLicenseFullName}:345`]: 'test drivers license full name',
  [`${DocumentDI.driversLicenseDOB}:345`]: 'test drivers license DOB',
  [`${DocumentDI.driversLicenseGender}:345`]: 'test drivers license gender',
  [`${DocumentDI.driversLicenseFullAddress}:345`]: 'test drivers license full address',
  [`${DocumentDI.driversLicenseDocumentNumber}:345`]: 'test drivers license document number',
  [`${DocumentDI.driversLicenseIssuedAt}:345`]: 'test drivers license issued at',
  [`${DocumentDI.driversLicenseExpiresAt}:345`]: 'test drivers license expires at',
  [`${DocumentDI.driversLicenseIssuingState}:345`]: 'test drivers license issuing state',
  [`${DocumentDI.driversLicenseIssuingCountry}:345`]: 'test drivers license issuing country',
  [`${DocumentDI.driversLicenseRefNumber}:345`]: 'test drivers license ref number',
};

export const entityVaultWithJustDriverseLicenseDIs: EntityVault = {
  [`${DocumentDI.latestDriversLicenseFront}:450`]: 'test drivers license front',
  [`${DocumentDI.latestDriversLicenseBack}:460`]: 'test drivers license back',
  [`${DocumentDI.latestDriversLicenseSelfie}:470`]: 'test drivers license selfie',
  ...driversLicenseExtractedDIs,
};

const entityVaultWithJustPassportDIs: EntityVault = {
  [`${DocumentDI.latestPassport}:787`]: 'test passport',
  [`${DocumentDI.latestPassportSelfie}:788`]: 'test passport selfie',
  [`${DocumentDI.passportFullName}:1738`]: 'test passport full name',
  [`${DocumentDI.passportDOB}:1738`]: 'test passport DOB',
  [`${DocumentDI.passportGender}:1738`]: 'test passport gender',
  [`${DocumentDI.passportFullAddress}:1738`]: 'test passport full address',
  [`${DocumentDI.passportDocumentNumber}:1738`]: 'test passport document number',
  [`${DocumentDI.passportIssuedAt}:1738`]: 'test passport issued at',
  [`${DocumentDI.passportExpiresAt}:1738`]: 'test passport expires at',
  [`${DocumentDI.passportIssuingState}:1738`]: 'test passport issuing state',
  [`${DocumentDI.passportIssuingCountry}:1738`]: 'test passport issuing country',
  [`${DocumentDI.passportRefNumber}:1738`]: 'test passport ref number',
};

export const entityVaultWithMultipleVersionsOfPassportDIs: EntityVault = {
  [`${DocumentDI.latestPassport}:787`]: 'test passport',
  [`${DocumentDI.latestPassportSelfie}:788`]: 'test passport selfie',
  [`${DocumentDI.passportFullName}:1738`]: 'test passport full name',
  [`${DocumentDI.passportDOB}:1738`]: 'test passport DOB',
  [`${DocumentDI.passportGender}:1738`]: 'test passport gender',
  [`${DocumentDI.passportFullAddress}:1738`]: 'test passport full address',
  [`${DocumentDI.passportDocumentNumber}:1738`]: 'test passport document number',
  [`${DocumentDI.passportIssuedAt}:1738`]: 'test passport issued at',
  [`${DocumentDI.passportExpiresAt}:1738`]: 'test passport expires at',
  [`${DocumentDI.passportIssuingState}:1738`]: 'test passport issuing state',
  [`${DocumentDI.passportIssuingCountry}:1738`]: 'test passport issuing country',
  [`${DocumentDI.passportRefNumber}:1738`]: 'test passport ref number',
  [`${DocumentDI.latestPassport}:679`]: 'test passport',
  [`${DocumentDI.latestPassportSelfie}:680`]: 'test passport selfie',
  [`${DocumentDI.passportFullName}:681`]: 'test passport full name',
  [`${DocumentDI.passportFullName}:2048`]: 'test passport DOB',
  [`${DocumentDI.passportDOB}:2048`]: 'test passport DOB',
  [`${DocumentDI.passportGender}:2048`]: 'test passport gender',
  [`${DocumentDI.passportFullAddress}:2048`]: 'test passport full address',
  [`${DocumentDI.passportDocumentNumber}:2048`]: 'test passport document number',
  [`${DocumentDI.passportIssuedAt}:2048`]: 'test passport issued at',
  [`${DocumentDI.passportExpiresAt}:2048`]: 'test passport expires at',
  [`${DocumentDI.passportIssuingState}:2048`]: 'test passport issuing state',
  [`${DocumentDI.passportIssuingCountry}:2048`]: 'test passport issuing country',
  [`${DocumentDI.passportRefNumber}:2048`]: 'test passport ref number',
};

export const entityVaultWithAllDocumentDIs: EntityVault = {
  ...entityVaultWithJustIDCardDIs,
  ...entityVaultWithJustDriverseLicenseDIs,
  ...entityVaultWithJustPassportDIs,
};
