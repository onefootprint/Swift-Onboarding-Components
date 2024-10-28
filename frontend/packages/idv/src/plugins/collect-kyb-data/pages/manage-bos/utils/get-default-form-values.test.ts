import type { HostedBusinessOwner } from '@onefootprint/request-types';
import {
  BeneficialOwnerDataAttribute,
  BootstrapOnlyBusinessPrimaryOwnerStake,
  BootstrapOnlyBusinessSecondaryOwnersKey,
  IdDI,
} from '@onefootprint/types';
import getDefaultFormValues from './get-default-form-values';

const MOCK_BO_EMPTY_PRIMARY: HostedBusinessOwner = {
  uuid: 'bo_link_primary',
  hasLinkedUser: true,
  isAuthedUser: true,
  isMutable: true,
  decryptedData: {},
  populatedData: [],
  ownershipStake: undefined,
  linkId: 'bo_link_primary',
};

const MOCK_BO_PRIMARY: HostedBusinessOwner = {
  uuid: 'bo_link_primary',
  hasLinkedUser: true,
  isAuthedUser: true,
  isMutable: true,
  decryptedData: {
    [IdDI.firstName]: 'Jane',
    [IdDI.lastName]: 'Doe',
    [IdDI.phoneNumber]: '+1234567890',
    [IdDI.email]: 'jane.doe@example.com',
  },
  populatedData: [IdDI.firstName, IdDI.lastName, IdDI.phoneNumber, IdDI.email],
  ownershipStake: 40,
  linkId: 'bo_link_primary',
};

const MOCK_BO_SECONDARY: HostedBusinessOwner = {
  uuid: 'bo_link_secondary',
  hasLinkedUser: false,
  isAuthedUser: false,
  isMutable: true,
  decryptedData: {
    [IdDI.firstName]: 'John',
    [IdDI.lastName]: 'Smith',
    [IdDI.phoneNumber]: '+1987654321',
    [IdDI.email]: 'john.smith@example.com',
  },
  populatedData: [IdDI.firstName, IdDI.lastName, IdDI.phoneNumber, IdDI.email],
  ownershipStake: 35,
  linkId: 'bo_link_secondary',
};

describe('getDefaultFormValues', () => {
  it('should return existing BOs when they are present', () => {
    const result = getDefaultFormValues([MOCK_BO_PRIMARY], {}, {});
    expect(result).toEqual([
      {
        uuid: MOCK_BO_PRIMARY.uuid,
        email: MOCK_BO_PRIMARY.decryptedData[IdDI.email],
        phoneNumber: MOCK_BO_PRIMARY.decryptedData[IdDI.phoneNumber],
        firstName: MOCK_BO_PRIMARY.decryptedData[IdDI.firstName],
        lastName: MOCK_BO_PRIMARY.decryptedData[IdDI.lastName],
        ownershipStake: MOCK_BO_PRIMARY.ownershipStake,
      },
    ]);
  });

  it('should add bootstrap info for primary BO', () => {
    const userBootstrapData = {
      [IdDI.firstName]: {
        value: 'John',
        isBootstrap: true,
      },
      [IdDI.lastName]: {
        value: 'Smith',
        isBootstrap: true,
      },
    };

    const result = getDefaultFormValues(
      [MOCK_BO_EMPTY_PRIMARY],
      {
        [BootstrapOnlyBusinessPrimaryOwnerStake]: {
          value: 40,
          isBootstrap: true,
        },
      },
      userBootstrapData,
    );
    expect(result).toEqual([
      {
        uuid: MOCK_BO_EMPTY_PRIMARY.uuid,
        email: '',
        phoneNumber: '',
        firstName: userBootstrapData[IdDI.firstName].value,
        lastName: userBootstrapData[IdDI.lastName].value,
        ownershipStake: 40,
      },
    ]);
  });

  it('should add bootstrap info for secondary BO', () => {
    const secondaryBoBootstrapData = {
      [BeneficialOwnerDataAttribute.firstName]: 'Jane',
      [BeneficialOwnerDataAttribute.lastName]: 'Doe',
      [BeneficialOwnerDataAttribute.email]: 'sandbox@onefootprint.com',
      [BeneficialOwnerDataAttribute.phoneNumber]: '+1234567890',
      [BeneficialOwnerDataAttribute.ownershipStake]: 35,
    };

    const result = getDefaultFormValues(
      [MOCK_BO_EMPTY_PRIMARY],
      {
        [BootstrapOnlyBusinessSecondaryOwnersKey]: {
          value: [secondaryBoBootstrapData],
          isBootstrap: true,
        },
      },
      {},
    );
    expect(result[1].email).toEqual(secondaryBoBootstrapData[BeneficialOwnerDataAttribute.email]);
    expect(result[1].phoneNumber).toEqual(secondaryBoBootstrapData[BeneficialOwnerDataAttribute.phoneNumber]);
    expect(result[1].firstName).toEqual(secondaryBoBootstrapData[BeneficialOwnerDataAttribute.firstName]);
    expect(result[1].lastName).toEqual(secondaryBoBootstrapData[BeneficialOwnerDataAttribute.lastName]);
    expect(result[1].ownershipStake).toEqual(secondaryBoBootstrapData[BeneficialOwnerDataAttribute.ownershipStake]);
  });

  it('shouldnt add secondary BO info if there is already a secondary BO', () => {
    const secondaryBoBootstrapData = {
      [BeneficialOwnerDataAttribute.firstName]: 'Flerp',
      [BeneficialOwnerDataAttribute.lastName]: 'Derp',
      [BeneficialOwnerDataAttribute.email]: 'derp@onefootprint.com',
      [BeneficialOwnerDataAttribute.phoneNumber]: '+1234567890',
      [BeneficialOwnerDataAttribute.ownershipStake]: 20,
    };

    const result = getDefaultFormValues(
      [MOCK_BO_EMPTY_PRIMARY, MOCK_BO_SECONDARY],
      {
        [BootstrapOnlyBusinessSecondaryOwnersKey]: {
          value: [secondaryBoBootstrapData],
          isBootstrap: true,
        },
      },
      {},
    );
    // Second BO should be from the existing backend data rather than from the bootstrap data
    expect(result[1].email).toEqual(MOCK_BO_SECONDARY.decryptedData[IdDI.email]);
    expect(result[1].phoneNumber).toEqual(MOCK_BO_SECONDARY.decryptedData[IdDI.phoneNumber]);
    expect(result[1].firstName).toEqual(MOCK_BO_SECONDARY.decryptedData[IdDI.firstName]);
    expect(result[1].lastName).toEqual(MOCK_BO_SECONDARY.decryptedData[IdDI.lastName]);
    expect(result[1].ownershipStake).toEqual(MOCK_BO_SECONDARY.ownershipStake);
  });
});
