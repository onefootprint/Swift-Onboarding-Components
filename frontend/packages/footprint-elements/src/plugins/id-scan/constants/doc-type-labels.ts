import { IdScanDocType } from '@onefootprint/types';

const IdScanDocTypeToLabel: Record<IdScanDocType, string> = {
  [IdScanDocType.driversLicense]: "driver's license",
  [IdScanDocType.idCard]: 'ID card',
  [IdScanDocType.passport]: 'passport',
};

export default IdScanDocTypeToLabel;
