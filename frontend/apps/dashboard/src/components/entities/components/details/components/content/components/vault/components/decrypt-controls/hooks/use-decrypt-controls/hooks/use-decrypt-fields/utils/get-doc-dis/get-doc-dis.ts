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
  if (dis.includes(DocumentDI.idCardFront)) {
    if (vaultData && !isVaultDataEmpty(vaultData?.[DocumentDI.idCardBack])) {
      dis.push(DocumentDI.idCardBack);
    }
    if (vaultData && !isVaultDataEmpty(vaultData?.[DocumentDI.idCardSelfie])) {
      dis.push(DocumentDI.idCardSelfie);
    }
  }
  if (dis.includes(DocumentDI.driversLicenseFront)) {
    if (
      vaultData &&
      !isVaultDataEmpty(vaultData?.[DocumentDI.driversLicenseBack])
    ) {
      dis.push(DocumentDI.driversLicenseBack);
    }
    if (
      vaultData &&
      !isVaultDataEmpty(vaultData?.[DocumentDI.driversLicenseSelfie])
    ) {
      dis.push(DocumentDI.driversLicenseSelfie);
    }
  }
  if (dis.includes(DocumentDI.passport)) {
    if (
      vaultData &&
      !isVaultDataEmpty(vaultData?.[DocumentDI.passportSelfie])
    ) {
      dis.push(DocumentDI.passportSelfie);
    }
  }

  return dis;
};

export default getDocDis;
