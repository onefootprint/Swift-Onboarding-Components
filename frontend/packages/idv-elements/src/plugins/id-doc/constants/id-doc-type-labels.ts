import { IdDocType } from '@onefootprint/types';

const IdDocTypeToLabel: Record<IdDocType, string> = {
  [IdDocType.driversLicense]: "driver's license",
  [IdDocType.idCard]: 'ID card',
  [IdDocType.passport]: 'passport',
};

export default IdDocTypeToLabel;
