import {
  DataIdentifier,
  DocumentDI,
  isVaultDataEmpty,
  VaultValue,
} from '@onefootprint/types';

const getDocDis = (
  dis: DataIdentifier[],
  vaultData?: Partial<Record<DataIdentifier, VaultValue>>,
) => {
  const extraFieldsToDecrypt: Partial<Record<DocumentDI, DocumentDI[]>> = {
    [DocumentDI.latestIdCardFront]: [
      DocumentDI.latestIdCardBack,
      DocumentDI.latestIdCardSelfie,
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
    ],
    [DocumentDI.latestDriversLicenseFront]: [
      DocumentDI.latestDriversLicenseBack,
      DocumentDI.latestDriversLicenseSelfie,
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
    ],
    [DocumentDI.latestPassport]: [
      DocumentDI.latestPassportSelfie,
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
    ],
  };
  Object.entries(extraFieldsToDecrypt).forEach(([mainDi, otherDis]) => {
    if (dis.includes(mainDi as DataIdentifier)) {
      otherDis.forEach(di => {
        if (vaultData && !isVaultDataEmpty(vaultData[di])) {
          dis.push(di);
        }
      });
    }
  });

  return dis;
};

export default getDocDis;
