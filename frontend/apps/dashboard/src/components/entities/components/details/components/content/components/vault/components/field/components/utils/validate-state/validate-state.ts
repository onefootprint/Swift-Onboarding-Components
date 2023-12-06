import EMPTY_SELECT_VALUE from '../../../../../constants';

export enum StateValidationError {
  SHOULD_BE_EMPTY,
  REQUIRED,
}

const validateState = (
  state: string,
  isDomestic: boolean,
): StateValidationError | undefined => {
  if (isDomestic && state === EMPTY_SELECT_VALUE) {
    return StateValidationError.REQUIRED;
  }
  if (!isDomestic && state !== EMPTY_SELECT_VALUE) {
    return StateValidationError.SHOULD_BE_EMPTY;
  }
  return undefined;
};

export default validateState;
