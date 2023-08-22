import { SupportedIdDocTypes } from '@onefootprint/types';

const IdDocTypeToLabel: Record<SupportedIdDocTypes, string> = {
  [SupportedIdDocTypes.driversLicense]: "driver's license",
  [SupportedIdDocTypes.idCard]: 'ID card',
  [SupportedIdDocTypes.passport]: 'passport',
  [SupportedIdDocTypes.visa]: 'visa',
  [SupportedIdDocTypes.residenceDocument]: 'residence card',
  [SupportedIdDocTypes.workPermit]: 'work permit',
};

export default IdDocTypeToLabel;
