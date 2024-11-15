import { DocumentDI } from '@onefootprint/types';

import getDataValue from './get-data-value';

describe('getDataValue', () => {
  it('should return dates formatted as MM/dd/yyyy', () => {
    const dob = getDataValue('2028-10-08', `${DocumentDI.idCardDOB}:456` as DocumentDI, '456');
    expect(dob).toEqual('10/08/2028');

    const expiresAt = getDataValue('2030-01-11', DocumentDI.passportCardExpiresAt, '');
    expect(expiresAt).toEqual('01/11/2030');
  });

  it('should return the correct string value for fields that need title case', () => {
    const name = getDataValue('sample name', `${DocumentDI.driversLicenseFullName}:456` as DocumentDI, '456');
    expect(name).toEqual('Sample Name');

    const state = getDataValue('NEW_YORK', DocumentDI.residenceDocumentIssuingState, '');
    expect(state).toEqual('New York');
  });

  it('should preserve 2-letter state/country codes in uppercase', () => {
    const address = getDataValue('2345 ANYPLACE AVE ANYTOWN NY 12345', DocumentDI.residenceDocumentFullAddress, '');
    expect(address).toEqual('2345 Anyplace Ave Anytown NY 12345');

    const country = getDataValue('US', DocumentDI.visaIssuingCountry, '');
    expect(country).toEqual('US');
  });

  it('should return fields that are not dates and do not need title case unchanged', () => {
    const dob = getDataValue('8AJ120T521', `${DocumentDI.visaRefNumber}:1` as DocumentDI, '1');
    expect(dob).toEqual('8AJ120T521');
  });
});
