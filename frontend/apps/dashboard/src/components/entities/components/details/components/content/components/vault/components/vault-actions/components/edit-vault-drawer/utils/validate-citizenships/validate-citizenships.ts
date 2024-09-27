import { COUNTRIES } from '@onefootprint/global-constants';
import { UsLegalStatus } from '@onefootprint/types';

export enum CitizenshipsValidationError {
  REQUIRED = 0,
  SHOULD_BE_EMPTY = 1,
  US_CITIZENSHIP = 2,
  INVALID = 3,
}

type ValidationError = {
  errorType: CitizenshipsValidationError;
  data?: string;
};

const formatCountryCode = (code: string) => code.toUpperCase().replace(/[^a-zA-Z]+$/, '');

const validateCitizenships = (maybeCountries: string, legalStatus: string): ValidationError | undefined => {
  const citizenships = maybeCountries.split(', ').filter((str: string) => str.length);

  const empty = !citizenships.length;
  const shouldBeEmpty = !(legalStatus === UsLegalStatus.permanentResident || legalStatus === UsLegalStatus.visa);
  if (empty && shouldBeEmpty) {
    return undefined;
  }
  if (empty && !shouldBeEmpty) {
    return { errorType: CitizenshipsValidationError.REQUIRED };
  }
  if (!empty && shouldBeEmpty) {
    return { errorType: CitizenshipsValidationError.SHOULD_BE_EMPTY };
  }

  if (citizenships.find((str: string) => formatCountryCode(str) === 'US')) {
    return { errorType: CitizenshipsValidationError.US_CITIZENSHIP };
  }

  const notFound = [] as string[];
  citizenships.forEach((str: string) => {
    const found = COUNTRIES.find(({ value }) => value === formatCountryCode(str));
    if (!found) {
      notFound.push(str);
    }
  });
  if (notFound.length) {
    return {
      errorType: CitizenshipsValidationError.INVALID,
      data: notFound.join(', '),
    };
  }

  return undefined;
};

export default validateCitizenships;
