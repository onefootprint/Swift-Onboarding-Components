import type { EntityVault } from '@onefootprint/types';
import { DocumentDI } from '@onefootprint/types';

export const entityId = 'fp_id_yCZehsWNeywHnk5JqL20u';

const driversLicensePartialDIs: EntityVault = {
  [DocumentDI.driversLicenseFullName]: 'test drivers license full name',
  [DocumentDI.driversLicenseDOB]: 'test drivers license DOB',
  [DocumentDI.driversLicenseGender]: 'test drivers license gender',
};

export default driversLicensePartialDIs;
