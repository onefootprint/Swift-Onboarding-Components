import type { CountryCode } from '@onefootprint/types';
import { isCountryCode } from '@onefootprint/types';

import getInitialCountry from '../../../../utils/get-initial-country';

const getCountrySelectOption = (maybeCountryCode?: string) => {
  if (maybeCountryCode && isCountryCode(maybeCountryCode)) {
    const fullCountryData = getInitialCountry(maybeCountryCode as CountryCode, false);
    return { label: fullCountryData?.label, value: fullCountryData?.value };
  }
  return undefined;
};

export default getCountrySelectOption;
