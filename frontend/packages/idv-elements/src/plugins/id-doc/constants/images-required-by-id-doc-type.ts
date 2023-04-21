import { IdDocType } from '@onefootprint/types';

const ImagesRequiredByIdDocType: Record<
  IdDocType,
  { front: boolean; back?: boolean }
> = {
  [IdDocType.idCard]: { front: true, back: true },
  [IdDocType.driversLicense]: { front: true, back: true },
  [IdDocType.passport]: { front: true },
};

export default ImagesRequiredByIdDocType;
