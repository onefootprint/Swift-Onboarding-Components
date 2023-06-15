import { COUNTRIES } from '@onefootprint/global-constants';
import { CountryCode, IdDocType } from '@onefootprint/types';

const IdDocTypesByCountry: Record<CountryCode, IdDocType[]> =
  Object.fromEntries(
    COUNTRIES.map(entry => {
      const idDocTypes = [];
      if (entry.driversLicense) {
        idDocTypes.push(IdDocType.driversLicense);
      }
      if (entry.idCard) {
        idDocTypes.push(IdDocType.idCard);
      }
      if (entry.passport) {
        idDocTypes.push(IdDocType.passport);
      }
      return [entry.value, idDocTypes];
    }),
  ) as Record<CountryCode, IdDocType[]>;

export default IdDocTypesByCountry;
