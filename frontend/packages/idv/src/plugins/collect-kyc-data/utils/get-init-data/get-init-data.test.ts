import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import getInitData from './get-init-data';

describe('getInitData', () => {
  it('should return an empty object if no bootstrap data is provided', () => {
    expect(getInitData([], {})).toEqual({});
    expect(getInitData([], {}, [IdDI.email, IdDI.firstName])).toEqual({});
  });

  const userData = {
    [IdDI.email]: {
      value: 'Email',
      isBootstrap: false,
    },
    [IdDI.firstName]: {
      value: 'Name',
      isBootstrap: true,
    },
  };

  it('should return populated data if bootstrap data is provided', () => {
    expect(
      getInitData(
        [CollectedKycDataOption.email, CollectedKycDataOption.name],
        userData,
      ),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: false,
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
        userData,
        [IdDI.email, IdDI.firstName],
      ),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: false,
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
        userData,
        [IdDI.email, IdDI.city],
      ),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: false,
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
          ...userData,
          [IdDI.city]: {
            value: 'City',
            isBootstrap: true,
          },
          [IdDI.state]: {
            value: 'State',
            isBootstrap: true,
          },
        },
        [IdDI.email, IdDI.city],
      ),
    ).toEqual({
      [IdDI.email]: {
        value: 'Email',
        bootstrap: false,
        disabled: true,
      },
      [IdDI.firstName]: {
        value: 'Name',
        bootstrap: true,
      },
    });
  });
});
