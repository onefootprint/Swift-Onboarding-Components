import { IdDocType, SupportedIdDocTypes } from '@onefootprint/types';

const extractIdDocTypesFromCdo = (cdo: string) => {
  if (!cdo.startsWith('document')) {
    return [];
  }

  const docTypes = cdo
    .split(/\.|,/)
    .flat()
    .filter(
      part =>
        part === IdDocType.idCard ||
        part === IdDocType.driversLicense ||
        part === SupportedIdDocTypes.driversLicense ||
        part === IdDocType.passport,
    );

  // We must be collecting all possible document types
  if (!docTypes.length) {
    return [IdDocType.idCard, IdDocType.driversLicense, IdDocType.passport];
  }

  const legacyDLIndex = docTypes.indexOf(SupportedIdDocTypes.driversLicense);
  if (legacyDLIndex > -1) {
    docTypes.splice(legacyDLIndex, 1, IdDocType.driversLicense);
  }
  return Array.from(new Set(docTypes));
};

export default extractIdDocTypesFromCdo;
