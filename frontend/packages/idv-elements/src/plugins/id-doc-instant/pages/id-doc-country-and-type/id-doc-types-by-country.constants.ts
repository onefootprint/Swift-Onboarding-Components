import { COUNTRIES } from '@onefootprint/global-constants';
import { CountryCode3, IdDocType } from '@onefootprint/types';

const IdDocTypesByCountry: Record<CountryCode3, IdDocType[]> =
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
      return [entry.value3, idDocTypes];
    }),
  ) as Record<CountryCode3, IdDocType[]>;

export default IdDocTypesByCountry;
