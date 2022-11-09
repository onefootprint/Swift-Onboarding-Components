import { IdScanDocType } from '@onefootprint/types';

const ImagesRequiredByDocType: Record<
  IdScanDocType,
  { front: boolean; back?: boolean }
> = {
  [IdScanDocType.idCard]: { front: true, back: true },
  [IdScanDocType.driversLicense]: { front: true, back: true },
  [IdScanDocType.passport]: { front: true },
};

export default ImagesRequiredByDocType;
