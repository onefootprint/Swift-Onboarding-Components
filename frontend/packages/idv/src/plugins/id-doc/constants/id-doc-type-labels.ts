import { SupportedIdDocTypes } from '@onefootprint/types';

const IdDocTypeToLabel: Record<SupportedIdDocTypes, string> = {
  [SupportedIdDocTypes.driversLicense]: "driver's license",
  [SupportedIdDocTypes.idCard]: 'ID card',
  [SupportedIdDocTypes.passport]: 'passport',
  [SupportedIdDocTypes.visa]: 'visa',
  [SupportedIdDocTypes.residenceDocument]: 'green card',
  [SupportedIdDocTypes.workPermit]: 'EAD card',
  [SupportedIdDocTypes.voterIdentification]: 'voter identification',
  [SupportedIdDocTypes.ssnCard]: 'ssn card',
  [SupportedIdDocTypes.lease]: 'lease',
  [SupportedIdDocTypes.bankStatement]: 'bank statement',
  [SupportedIdDocTypes.utilityBill]: 'utility bill',
  [SupportedIdDocTypes.proofOfAddress]: 'proof of address',
};

export default IdDocTypeToLabel;
