import { IdDocType, SupportedIdDocTypes } from '@onefootprint/types';

const idDocTypeToSupportedType = {
  [IdDocType.idCard]: SupportedIdDocTypes.idCard,
  [IdDocType.driversLicense]: SupportedIdDocTypes.driversLicense,
  [IdDocType.passport]: SupportedIdDocTypes.passport,
};

export default idDocTypeToSupportedType;
