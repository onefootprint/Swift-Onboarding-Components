import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import getInitData from './get-init-data';

describe('getInitData', () => {
  it('should return an empty object if no bootstrap data is provided', () => {
    expect(getInitData([])).toEqual({});
    expect(getInitData([], {}, [IdDI.email, IdDI.firstName])).toEqual({});
  });

  const bootstrapData = {
    [IdDI.email]: 'Email',
    [IdDI.firstName]: 'Name',
  };

  it('should return populated data if bootstrap data is provided', () => {
    expect(
      getInitData(
        [CollectedKycDataOption.email, CollectedKycDataOption.name],
        bootstrapData,
      ),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: true,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
      },
    });
  });

  it('marks disabled fields', () => {
    expect(
      getInitData(
        [CollectedKycDataOption.email, CollectedKycDataOption.name],
        bootstrapData,
        [IdDI.email, IdDI.firstName],
      ),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: true,
        disabled: true,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
        disabled: true,
      },
    });
  });

  it('only marks disabled fields that are in the bootstrap data', () => {
    expect(
      getInitData(
        [CollectedKycDataOption.email, CollectedKycDataOption.name],
        bootstrapData,
        [IdDI.email, IdDI.city],
      ),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: true,
        disabled: true,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
      },
    });
  });

  it('filters out fields that are not in ob config must collect', () => {
    expect(
      getInitData(
        [CollectedKycDataOption.email, CollectedKycDataOption.name],
        {
          ...bootstrapData,
          [IdDI.city]: 'City',
          [IdDI.state]: 'State',
        },
        [IdDI.email, IdDI.city],
      ),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: true,
        disabled: true,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
      },
    });
  });
});
