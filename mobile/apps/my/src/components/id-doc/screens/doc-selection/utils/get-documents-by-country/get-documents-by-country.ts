import { CountryRecord } from '@onefootprint/global-constants';
import { IdDocType } from '@onefootprint/types';

export const getAvailableDocumentTypesByCountry = (country: CountryRecord) => {
  const availableTypes: IdDocType[] = [];
  if (country.driversLicense) {
    availableTypes.push(IdDocType.driversLicense);
  }
  if (country.idCard) {
    availableTypes.push(IdDocType.idCard);
  }
  if (country.passport) {
    availableTypes.push(IdDocType.passport);
  }
  return availableTypes;
};

export const getDocumentTypeByCountry = (
  country: CountryRecord,
  previousType?: IdDocType,
) => {
  const availableDocumentTypes = getAvailableDocumentTypesByCountry(country);
  if (availableDocumentTypes.includes(previousType)) {
    return previousType;
  }
  const [firstOption] = availableDocumentTypes;
  return firstOption;
};
