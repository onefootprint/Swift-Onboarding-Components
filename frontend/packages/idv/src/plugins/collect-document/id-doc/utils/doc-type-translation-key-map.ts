import { SupportedIdDocTypes } from '@onefootprint/types';

const docTypeTranslationKeyMap: {
  [key in SupportedIdDocTypes]: string;
} = {
  [SupportedIdDocTypes.driversLicense]: 'driversLicense',
  [SupportedIdDocTypes.idCard]: 'idCard',
  [SupportedIdDocTypes.passport]: 'passport',
  [SupportedIdDocTypes.visa]: 'visa',
  [SupportedIdDocTypes.workPermit]: 'workPermit',
  [SupportedIdDocTypes.residenceDocument]: 'residenceDocument',
  [SupportedIdDocTypes.voterIdentification]: 'voterIdentification',
  [SupportedIdDocTypes.ssnCard]: 'ssnCard',
  [SupportedIdDocTypes.lease]: 'lease',
  [SupportedIdDocTypes.bankStatement]: 'bankStatement',
  [SupportedIdDocTypes.utilityBill]: 'utilityBill',
  [SupportedIdDocTypes.proofOfAddress]: 'proofOfAddress',
  [SupportedIdDocTypes.passportCard]: 'passportCard',
  [SupportedIdDocTypes.custom]: 'custom',
};

export default docTypeTranslationKeyMap;
