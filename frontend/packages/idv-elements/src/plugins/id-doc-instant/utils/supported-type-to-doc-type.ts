import IdDocType, {
  SupportedIdDocTypes,
} from '@onefootprint/types/src/data/id-doc-type';

const supportedTypeToIdDocType = {
  [SupportedIdDocTypes.idCard]: IdDocType.idCard,
  [SupportedIdDocTypes.driversLicense]: IdDocType.driversLicense,
  [SupportedIdDocTypes.passport]: IdDocType.passport,
};

export default supportedTypeToIdDocType;
