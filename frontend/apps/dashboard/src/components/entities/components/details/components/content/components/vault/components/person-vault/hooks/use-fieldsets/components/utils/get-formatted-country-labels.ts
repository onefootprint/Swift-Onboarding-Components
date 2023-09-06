import type { CountryCode } from '@onefootprint/types';
import { isCountryCode } from '@onefootprint/types';

import getInitialCountry from './get-initial-country';

const getFormattedCountryLabels = (value: Array<string>): string =>
  value
    .filter((country: string) => isCountryCode(country))
    .map((country: string) => getInitialCountry(country as CountryCode).label)
    .join(', ');

export default getFormattedCountryLabels;
