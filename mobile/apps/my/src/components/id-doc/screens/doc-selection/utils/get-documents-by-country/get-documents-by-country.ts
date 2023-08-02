import { CountryRecord } from '@onefootprint/global-constants';
import { SupportedIdDocTypes } from '@onefootprint/types';

export const getAvailableDocTypesByCountry = (country: CountryRecord) => {
  const availableTypes: SupportedIdDocTypes[] = [];
  if (country.driversLicense) {
    availableTypes.push(SupportedIdDocTypes.driversLicense);
  }
  if (country.idCard) {
    availableTypes.push(SupportedIdDocTypes.idCard);
  }
  if (country.passport) {
    availableTypes.push(SupportedIdDocTypes.passport);
  }
  return availableTypes;
};

export const getDocTypeByCountry = (
  country: CountryRecord,
  previousType?: SupportedIdDocTypes,
) => {
  const availableDocumentTypes = getAvailableDocTypesByCountry(country);
  if (availableDocumentTypes.includes(previousType)) {
    return previousType;
  }
  const [firstOption] = availableDocumentTypes;
  return firstOption;
};
