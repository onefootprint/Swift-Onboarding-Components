import {
  CollectedDocumentDataOption,
  CollectedKycDataOption,
  IdDocType,
} from '@onefootprint/types';

import extractIdDocTypesFromCdo from './extract-id-doc-types-from-cdo';

describe('extractIdDocTypesFromCdo', () => {
  it('should return an array of id doc types', () => {
    expect(
      extractIdDocTypesFromCdo(CollectedDocumentDataOption.document),
    ).toEqual([IdDocType.idCard, IdDocType.driversLicense, IdDocType.passport]);
    expect(
      extractIdDocTypesFromCdo(CollectedDocumentDataOption.documentAndSelfie),
    ).toEqual([IdDocType.idCard, IdDocType.driversLicense, IdDocType.passport]);
    expect(extractIdDocTypesFromCdo(CollectedKycDataOption.dob)).toEqual([]);
    expect(extractIdDocTypesFromCdo('document.id_card.none.none')).toEqual([
      IdDocType.idCard,
    ]);
    expect(extractIdDocTypesFromCdo('document.passport.none.none')).toEqual([
      IdDocType.passport,
    ]);
    expect(
      extractIdDocTypesFromCdo('document.drivers_license.none.none'),
    ).toEqual([IdDocType.driversLicense]);
    expect(
      extractIdDocTypesFromCdo('document.driver_license.none.none'),
    ).toEqual([IdDocType.driversLicense]);
    expect(
      extractIdDocTypesFromCdo('document.id_card,drivers_license.none.none'),
    ).toEqual([IdDocType.idCard, IdDocType.driversLicense]);
  });
});
