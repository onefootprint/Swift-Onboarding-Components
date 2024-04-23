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
      `${DocumentDI.idCardFullName}:3`,
      `${DocumentDI.idCardDOB}:3`,
      `${DocumentDI.idCardGender}:3`,
      `${DocumentDI.idCardFullAddress}:3`,
      `${DocumentDI.idCardDocumentNumber}:3`,
      `${DocumentDI.idCardIssuedAt}:3`,
      `${DocumentDI.idCardExpiresAt}:3`,
      `${DocumentDI.idCardIssuingState}:3`,
      `${DocumentDI.idCardIssuingCountry}:3`,
      `${DocumentDI.idCardRefNumber}:3`,
      `${DocumentDI.latestIdCardFront}:123`,
      `${DocumentDI.latestIdCardBack}:125`,
      `${DocumentDI.latestIdCardSelfie}:124`,
      `${DocumentDI.idCardFullName}:5`,
      `${DocumentDI.idCardDOB}:5`,
      `${DocumentDI.idCardGender}:5`,
      `${DocumentDI.idCardFullAddress}:5`,
      `${DocumentDI.idCardDocumentNumber}:5`,
      `${DocumentDI.idCardIssuedAt}:5`,
      `${DocumentDI.idCardExpiresAt}:5`,
      `${DocumentDI.idCardIssuingState}:5`,
      `${DocumentDI.idCardIssuingCountry}:5`,
      `${DocumentDI.idCardRefNumber}:5`,
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
      `${DocumentDI.driversLicenseFullName}:787`,
      `${DocumentDI.driversLicenseDOB}:787`,
      `${DocumentDI.driversLicenseGender}:787`,
      `${DocumentDI.driversLicenseFullAddress}:787`,
      `${DocumentDI.driversLicenseDocumentNumber}:787`,
      `${DocumentDI.driversLicenseIssuedAt}:787`,
      `${DocumentDI.driversLicenseExpiresAt}:787`,
      `${DocumentDI.driversLicenseIssuingState}:787`,
      `${DocumentDI.driversLicenseIssuingCountry}:787`,
      `${DocumentDI.driversLicenseRefNumber}:787`,
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
      `${DocumentDI.driversLicenseFullName}:787`,
      `${DocumentDI.driversLicenseDOB}:787`,
      `${DocumentDI.driversLicenseGender}:787`,
      `${DocumentDI.driversLicenseFullAddress}:787`,
      `${DocumentDI.driversLicenseDocumentNumber}:787`,
      `${DocumentDI.driversLicenseIssuedAt}:787`,
      `${DocumentDI.driversLicenseExpiresAt}:787`,
      `${DocumentDI.driversLicenseIssuingState}:787`,
      `${DocumentDI.driversLicenseIssuingCountry}:787`,
      `${DocumentDI.driversLicenseRefNumber}:787`,
      `${DocumentDI.latestDriversLicenseFront}:450`,
      `${DocumentDI.latestDriversLicenseBack}:460`,
      `${DocumentDI.latestDriversLicenseSelfie}:470`,
      `${DocumentDI.driversLicenseFullName}:1738`,
      `${DocumentDI.driversLicenseDOB}:1738`,
      `${DocumentDI.driversLicenseGender}:1738`,
      `${DocumentDI.driversLicenseFullAddress}:1738`,
      `${DocumentDI.driversLicenseDocumentNumber}:1738`,
      `${DocumentDI.driversLicenseIssuedAt}:1738`,
      `${DocumentDI.driversLicenseExpiresAt}:1738`,
      `${DocumentDI.driversLicenseIssuingState}:1738`,
      `${DocumentDI.driversLicenseIssuingCountry}:1738`,
      `${DocumentDI.driversLicenseRefNumber}:1738`,
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
