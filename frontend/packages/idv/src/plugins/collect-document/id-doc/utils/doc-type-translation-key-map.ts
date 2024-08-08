import { SupportedIdDocTypes } from '@onefootprint/types';

const docTypeTranslationKeyMap = {
  [SupportedIdDocTypes.driversLicense]: 'driversLicense' as const,
  [SupportedIdDocTypes.idCard]: 'idCard' as const,
  [SupportedIdDocTypes.passport]: 'passport' as const,
  [SupportedIdDocTypes.visa]: 'visa' as const,
  [SupportedIdDocTypes.workPermit]: 'workPermit' as const,
  [SupportedIdDocTypes.residenceDocument]: 'residenceDocument' as const,
  [SupportedIdDocTypes.voterIdentification]: 'voterIdentification' as const,
  [SupportedIdDocTypes.ssnCard]: 'ssnCard' as const,
  [SupportedIdDocTypes.lease]: 'lease' as const,
  [SupportedIdDocTypes.bankStatement]: 'bankStatement' as const,
  [SupportedIdDocTypes.utilityBill]: 'utilityBill' as const,
  [SupportedIdDocTypes.proofOfAddress]: 'proofOfAddress' as const,
  [SupportedIdDocTypes.passportCard]: 'passportCard' as const,
  [SupportedIdDocTypes.custom]: 'custom' as const,
};

export default docTypeTranslationKeyMap;
