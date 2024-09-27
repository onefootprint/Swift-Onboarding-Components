import { UsLegalStatus } from '@onefootprint/types';

import { EMPTY_SELECT_VALUE } from '../../constants';
import validateVisaKind, { VisaKindValidationError } from './validate-visa-kind';

describe('ValidateVisaKind', () => {
  it('should reject any Visa Kind when the Legal Status is not Visa', () => {
    expect(validateVisaKind('e1', UsLegalStatus.citizen)).toBe(VisaKindValidationError.SHOULD_BE_EMPTY);
    expect(validateVisaKind('f1', UsLegalStatus.citizen)).toBe(VisaKindValidationError.SHOULD_BE_EMPTY);
    expect(validateVisaKind('h1b', UsLegalStatus.permanentResident)).toBe(VisaKindValidationError.SHOULD_BE_EMPTY);
    expect(validateVisaKind('l1', UsLegalStatus.permanentResident)).toBe(VisaKindValidationError.SHOULD_BE_EMPTY);
    expect(validateVisaKind('tn1', EMPTY_SELECT_VALUE)).toBe(VisaKindValidationError.SHOULD_BE_EMPTY);
    expect(validateVisaKind('other', EMPTY_SELECT_VALUE)).toBe(VisaKindValidationError.SHOULD_BE_EMPTY);
  });

  it('should reject an empty Visa Kind when the Legal Status is Visa', () => {
    expect(validateVisaKind(EMPTY_SELECT_VALUE, UsLegalStatus.visa)).toBe(VisaKindValidationError.REQUIRED);
  });

  it('should accept an empty Visa Kind when the Legal Status is not Visa', () => {
    expect(validateVisaKind(EMPTY_SELECT_VALUE, UsLegalStatus.citizen)).toBe(undefined);
    expect(validateVisaKind(EMPTY_SELECT_VALUE, UsLegalStatus.permanentResident)).toBe(undefined);
    expect(validateVisaKind(EMPTY_SELECT_VALUE, EMPTY_SELECT_VALUE)).toBe(undefined);
  });
  it('should accept a valid Visa Kind when the Legal Status is Visa', () => {
    expect(validateVisaKind('e2', UsLegalStatus.visa)).toBe(undefined);
    expect(validateVisaKind('e3', UsLegalStatus.visa)).toBe(undefined);
    expect(validateVisaKind('g4', UsLegalStatus.visa)).toBe(undefined);
    expect(validateVisaKind('tn1', UsLegalStatus.visa)).toBe(undefined);
  });
});
