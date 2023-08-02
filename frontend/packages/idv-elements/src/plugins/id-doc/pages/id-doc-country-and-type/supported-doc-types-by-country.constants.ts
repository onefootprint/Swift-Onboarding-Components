import { COUNTRIES } from '@onefootprint/global-constants';
import { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';

const SupportedDocTypesByCountry: Record<CountryCode, SupportedIdDocTypes[]> =
  Object.fromEntries(
    COUNTRIES.map(entry => {
      const supportedDocTypes = [];
      if (entry.driversLicense) {
        supportedDocTypes.push(SupportedIdDocTypes.driversLicense);
      }
      if (entry.idCard) {
        supportedDocTypes.push(SupportedIdDocTypes.idCard);
      }
      if (entry.passport) {
        supportedDocTypes.push(SupportedIdDocTypes.passport);
      }
      return [entry.value, supportedDocTypes];
    }),
  ) as Record<CountryCode, SupportedIdDocTypes[]>;

export default SupportedDocTypesByCountry;
