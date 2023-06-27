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
    ],
    [DocumentDI.latestDriversLicenseFront]: [
      DocumentDI.latestDriversLicenseBack,
      DocumentDI.latestDriversLicenseSelfie,
    ],
    [DocumentDI.latestPassport]: [DocumentDI.latestPassportSelfie],
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
