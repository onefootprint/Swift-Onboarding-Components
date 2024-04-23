import { DocumentDI } from '@onefootprint/types';

import getDataLabel from './get-data-label';

describe('getDataLabel', () => {
  it('should return the correct label for ID card DI', () => {
    const label = getDataLabel(`${DocumentDI.idCardDOB}:456`, '456');
    expect(label).toEqual('dob');
  });

  it('should return the correct label for drivers license DI', () => {
    const label = getDataLabel(
      `${DocumentDI.driversLicenseFullName}:12345`,
      '12345',
    );
    expect(label).toEqual('full_name');
  });

  it('should return the correct label for passport DI', () => {
    const label = getDataLabel(`${DocumentDI.passportExpiresAt}:789`, '789');
    expect(label).toEqual('expires_at');
  });

  it('should return unchanged string for other id-doc DI', () => {
    const label = getDataLabel(`${DocumentDI.finraComplianceLetter}`, '789');
    expect(label).toEqual('document.finra_compliance_letter');
  });
});
