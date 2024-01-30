import { SupportedIdDocTypes } from '@onefootprint/types';

const extractIdDocTypesFromCdo = (cdo: string) => {
  if (!cdo.startsWith('document')) {
    return [];
  }

  const docTypes = cdo
    .split(/\.|,/)
    .flat()
    .filter(
      part =>
        part === SupportedIdDocTypes.idCard ||
        part === SupportedIdDocTypes.driversLicense ||
        part === SupportedIdDocTypes.passport ||
        part === SupportedIdDocTypes.visa ||
        part === SupportedIdDocTypes.workPermit ||
        part === SupportedIdDocTypes.residenceDocument,
    );

  // We must be collecting all possible document types
  if (!docTypes.length) {
    return [
      SupportedIdDocTypes.idCard,
      SupportedIdDocTypes.driversLicense,
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.visa,
      SupportedIdDocTypes.residenceDocument,
      SupportedIdDocTypes.workPermit,
    ];
  }

  return Array.from(new Set(docTypes));
};

export default extractIdDocTypesFromCdo;
