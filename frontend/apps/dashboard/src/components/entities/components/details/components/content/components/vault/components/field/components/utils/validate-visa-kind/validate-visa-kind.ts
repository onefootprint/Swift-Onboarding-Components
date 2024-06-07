import { UsLegalStatus } from '@onefootprint/types';

import EMPTY_SELECT_VALUE from '../../../../../constants';

export enum VisaKindValidationError {
  SHOULD_BE_EMPTY,
  REQUIRED,
}

const validateVisaKind = (visaKind: string, legalStatus: string): VisaKindValidationError | undefined => {
  if (legalStatus === UsLegalStatus.visa && visaKind === EMPTY_SELECT_VALUE) {
    return VisaKindValidationError.REQUIRED;
  }
  if (legalStatus !== UsLegalStatus.visa && visaKind !== EMPTY_SELECT_VALUE) {
    return VisaKindValidationError.SHOULD_BE_EMPTY;
  }
  return undefined;
};

export default validateVisaKind;
