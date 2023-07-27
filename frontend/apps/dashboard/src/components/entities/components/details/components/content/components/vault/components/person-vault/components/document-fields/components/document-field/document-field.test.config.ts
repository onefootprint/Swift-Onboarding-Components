import { DocumentDI, EntityVault } from '@onefootprint/types';

const driversLicensePartialDIs: EntityVault = {
  [DocumentDI.driversLicenseFullName]: 'test drivers license full name',
  [DocumentDI.driversLicenseDOB]: 'test drivers license DOB',
  [DocumentDI.driversLicenseGender]: 'test drivers license gender',
};

export default driversLicensePartialDIs;
