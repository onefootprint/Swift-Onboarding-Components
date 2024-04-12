import { DocumentDI } from '@onefootprint/types';

import getDocDis from './get-doc-dis';
import {
  driversLicenseDocument1,
  driversLicenseDocument2,
  entityVaultWithIDCardAndDriversLicenseDIs,
  entityVaultWithJustIDCardDIs,
  idCardDocument1,
  idCardDocument2,
  incompleteDriversLicense,
} from './get-doc-dis.test.config';

describe('getDocDis', () => {
  it('should return correct DIs when there are multiple documents of same type', () => {
    expect(
      getDocDis({
        dis: [DocumentDI.latestIdCardFront],
        documents: [idCardDocument1, idCardDocument2],
        vaultData: entityVaultWithJustIDCardDIs,
      }),
    ).toEqual([
      DocumentDI.latestIdCardFront,
      `${DocumentDI.idCardFullName}`,
      `${DocumentDI.idCardDOB}`,
      `${DocumentDI.idCardGender}`,
      `${DocumentDI.idCardFullAddress}`,
      `${DocumentDI.idCardDocumentNumber}`,
      `${DocumentDI.idCardIssuedAt}`,
      `${DocumentDI.idCardExpiresAt}`,
      `${DocumentDI.idCardIssuingState}`,
      `${DocumentDI.idCardIssuingCountry}`,
      `${DocumentDI.idCardRefNumber}`,
      `${DocumentDI.latestIdCardFront}:123`,
      `${DocumentDI.latestIdCardBack}:125`,
      `${DocumentDI.latestIdCardSelfie}:124`,
      `${DocumentDI.idCardFullName}`,
      `${DocumentDI.idCardDOB}`,
      `${DocumentDI.idCardGender}`,
      `${DocumentDI.idCardFullAddress}`,
      `${DocumentDI.idCardDocumentNumber}`,
      `${DocumentDI.idCardIssuedAt}`,
      `${DocumentDI.idCardExpiresAt}`,
      `${DocumentDI.idCardIssuingState}`,
      `${DocumentDI.idCardIssuingCountry}`,
      `${DocumentDI.idCardRefNumber}`,
      `${DocumentDI.latestIdCardFront}:250`,
      `${DocumentDI.latestIdCardBack}:260`,
      `${DocumentDI.latestIdCardSelfie}:270`,
    ]);
  });

  it('should return correct DIs for when there are multiple documents of different types, but only one of the type requested', () => {
    expect(
      getDocDis({
        dis: [DocumentDI.latestDriversLicenseFront],
        documents: [driversLicenseDocument1, idCardDocument1, idCardDocument2],
        vaultData: entityVaultWithIDCardAndDriversLicenseDIs,
      }),
    ).toEqual([
      DocumentDI.latestDriversLicenseFront,
      `${DocumentDI.driversLicenseFullName}`,
      `${DocumentDI.driversLicenseDOB}`,
      `${DocumentDI.driversLicenseGender}`,
      `${DocumentDI.driversLicenseFullAddress}`,
      `${DocumentDI.driversLicenseDocumentNumber}`,
      `${DocumentDI.driversLicenseIssuedAt}`,
      `${DocumentDI.driversLicenseExpiresAt}`,
      `${DocumentDI.driversLicenseIssuingState}`,
      `${DocumentDI.driversLicenseIssuingCountry}`,
      `${DocumentDI.driversLicenseRefNumber}`,
      `${DocumentDI.latestDriversLicenseFront}:450`,
      `${DocumentDI.latestDriversLicenseBack}:460`,
      `${DocumentDI.latestDriversLicenseSelfie}:470`,
    ]);
  });

  it('should return correct DIs for when there are multiple documents of different types, and multiple of the type requested', () => {
    expect(
      getDocDis({
        dis: [DocumentDI.latestDriversLicenseFront],
        documents: [
          driversLicenseDocument1,
          driversLicenseDocument2,
          idCardDocument1,
          idCardDocument2,
        ],
        vaultData: entityVaultWithIDCardAndDriversLicenseDIs,
      }),
    ).toEqual([
      DocumentDI.latestDriversLicenseFront,
      `${DocumentDI.driversLicenseFullName}`,
      `${DocumentDI.driversLicenseDOB}`,
      `${DocumentDI.driversLicenseGender}`,
      `${DocumentDI.driversLicenseFullAddress}`,
      `${DocumentDI.driversLicenseDocumentNumber}`,
      `${DocumentDI.driversLicenseIssuedAt}`,
      `${DocumentDI.driversLicenseExpiresAt}`,
      `${DocumentDI.driversLicenseIssuingState}`,
      `${DocumentDI.driversLicenseIssuingCountry}`,
      `${DocumentDI.driversLicenseRefNumber}`,
      `${DocumentDI.latestDriversLicenseFront}:450`,
      `${DocumentDI.latestDriversLicenseBack}:460`,
      `${DocumentDI.latestDriversLicenseSelfie}:470`,
      `${DocumentDI.driversLicenseFullName}`,
      `${DocumentDI.driversLicenseDOB}`,
      `${DocumentDI.driversLicenseGender}`,
      `${DocumentDI.driversLicenseFullAddress}`,
      `${DocumentDI.driversLicenseDocumentNumber}`,
      `${DocumentDI.driversLicenseIssuedAt}`,
      `${DocumentDI.driversLicenseExpiresAt}`,
      `${DocumentDI.driversLicenseIssuingState}`,
      `${DocumentDI.driversLicenseIssuingCountry}`,
      `${DocumentDI.driversLicenseRefNumber}`,
      `${DocumentDI.latestDriversLicenseFront}:789`,
      `${DocumentDI.latestDriversLicenseBack}:790`,
      `${DocumentDI.latestDriversLicenseSelfie}:791`,
    ]);
  });

  it('should return only partial list of uploads for incomplete document and no extracted data', () => {
    expect(
      getDocDis({
        dis: [DocumentDI.latestDriversLicenseFront],
        documents: [incompleteDriversLicense],
        vaultData: entityVaultWithIDCardAndDriversLicenseDIs,
      }),
    ).toEqual([
      DocumentDI.latestDriversLicenseFront,
      `${DocumentDI.latestDriversLicenseFront}:789`,
      `${DocumentDI.latestDriversLicenseBack}:790`,
    ]);
  });
});
