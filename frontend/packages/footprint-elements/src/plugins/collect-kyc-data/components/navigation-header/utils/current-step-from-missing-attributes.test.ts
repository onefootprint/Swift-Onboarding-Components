import { CollectedKycDataOption } from '@onefootprint/types';

import getCurrentStepFromMissingAttributes from './current-step-from-missing-attributes';

describe('getCurrentStepFromMissingAttributes', () => {
  it('returns 0 when there are no missing attributes', () => {
    expect(getCurrentStepFromMissingAttributes([], 'basicInformation')).toEqual(
      0,
    );
  });

  it('returns 1 if showing the page with only missing attribute', () => {
    expect(
      getCurrentStepFromMissingAttributes(
        [CollectedKycDataOption.partialAddress],
        'residentialAddress',
      ),
    ).toEqual(1);
  });

  it('calculates correctly with multiple missing attributes and pages', () => {
    expect(
      getCurrentStepFromMissingAttributes(
        [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
        'basicInformation',
      ),
    ).toEqual(1);

    expect(
      getCurrentStepFromMissingAttributes(
        [CollectedKycDataOption.dob, CollectedKycDataOption.fullAddress],
        'residentialAddress',
      ),
    ).toEqual(2);
  });
});
