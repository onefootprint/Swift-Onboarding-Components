import { SupportedIdDocTypes } from '@onefootprint/types';

const IdDocTypeToLabel: Record<SupportedIdDocTypes, string> = {
  [SupportedIdDocTypes.driversLicense]: "driver's license",
  [SupportedIdDocTypes.idCard]: 'ID card',
  [SupportedIdDocTypes.passport]: 'passport',
  [SupportedIdDocTypes.visa]: 'visa',
  [SupportedIdDocTypes.residenceDocument]: 'green card',
  [SupportedIdDocTypes.workPermit]: 'EAD card',
};

export default IdDocTypeToLabel;
