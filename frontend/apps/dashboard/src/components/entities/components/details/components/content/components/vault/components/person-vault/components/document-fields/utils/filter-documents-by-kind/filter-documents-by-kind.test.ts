import { SupportedIdDocTypes } from '@onefootprint/types';

import getRelevantDocuments from './filter-documents-by-kind';
import {
  documentsFixture,
  driversLicenseDocument1,
  driversLicenseDocument2,
  idCardDocument1,
  passportDocument1,
} from './filter-documents-by-kind.test.config';

describe('getRelevantDocuments', () => {
  it('should filter only ID card documents properly', () => {
    expect(getRelevantDocuments(documentsFixture, SupportedIdDocTypes.idCard)).toEqual([idCardDocument1]);
  });

  it('should filter only drivers license documents properly', () => {
    expect(getRelevantDocuments(documentsFixture, SupportedIdDocTypes.driversLicense)).toEqual([
      driversLicenseDocument1,
      driversLicenseDocument2,
    ]);
  });

  it('should filter only passport documents properly', () => {
    expect(getRelevantDocuments(documentsFixture, SupportedIdDocTypes.passport)).toEqual([passportDocument1]);
  });
});
