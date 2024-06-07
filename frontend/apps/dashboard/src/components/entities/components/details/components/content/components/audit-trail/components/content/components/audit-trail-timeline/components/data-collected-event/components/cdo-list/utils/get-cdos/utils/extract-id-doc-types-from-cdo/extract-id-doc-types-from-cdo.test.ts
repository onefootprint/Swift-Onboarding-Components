import { CollectedDocumentDataOption, CollectedKycDataOption, SupportedIdDocTypes } from '@onefootprint/types';

import extractIdDocTypesFromCdo from './extract-id-doc-types-from-cdo';

describe('extractIdDocTypesFromCdo', () => {
  it('should return an array of id doc types', () => {
    expect(extractIdDocTypesFromCdo(CollectedDocumentDataOption.document)).toEqual([
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.workPermit,
    ]);
    expect(extractIdDocTypesFromCdo(CollectedDocumentDataOption.documentAndSelfie)).toEqual([
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.workPermit,
    ]);
    expect(extractIdDocTypesFromCdo(CollectedKycDataOption.dob)).toEqual([]);
    expect(extractIdDocTypesFromCdo('document.id_card.none.none')).toEqual([SupportedIdDocTypes.idCard]);
    expect(extractIdDocTypesFromCdo('document.passport.none.none')).toEqual([SupportedIdDocTypes.passport]);
    expect(extractIdDocTypesFromCdo('document.drivers_license.none.none')).toEqual([
      SupportedIdDocTypes.driversLicense,
    ]);
    expect(extractIdDocTypesFromCdo('document.id_card,drivers_license.none.none')).toEqual([
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.driversLicense,
    ]);
  });
});
