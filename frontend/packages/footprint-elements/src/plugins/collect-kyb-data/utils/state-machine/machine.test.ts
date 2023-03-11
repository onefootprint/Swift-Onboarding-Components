import { DeviceInfo } from '@onefootprint/hooks';
import {
  BeneficialOwnerDataAttribute,
  BusinessDataAttribute,
  CollectedKybDataOption,
  CollectedKycDataOption,
  OnboardingConfig,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import createCollectKybDataMachine from './machine';

describe('Collect KYB Data Machine Tests', () => {
  const TestOnboardingConfig: OnboardingConfig = {
    createdAt: 'date',
    id: 'id',
    isLive: true,
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: 'enabled',
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
  };

  const createMachine = (
    missingKybAttributes: CollectedKybDataOption[],
    missingKycAttributes: CollectedKycDataOption[],
    device: DeviceInfo = {
      type: 'mobile',
      hasSupportForWebauthn: false,
    },
  ) => {
    const machine = interpret(createCollectKybDataMachine());
    machine.start();
    machine.send({
      type: 'receivedContext',
      payload: {
        authToken: 'authToken',
        device,
        userFound: true,
        config: { ...TestOnboardingConfig },
        missingKybAttributes,
        missingKycAttributes,
      },
    });
    return machine;
  };

  it('visits all pages when all attributes are missing', () => {
    const machine = createMachine(
      [
        CollectedKybDataOption.name,
        CollectedKybDataOption.ein,
        CollectedKybDataOption.address,
        CollectedKybDataOption.beneficialOwners,
      ],
      [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
    );
    let { state } = machine;

    expect(state.value).toEqual('introduction');
    state = machine.send('introductionCompleted');

    expect(state.value).toEqual('basicData');
    state = machine.send('basicDataSubmitted', {
      payload: {
        [BusinessDataAttribute.name]: 'Acme Inc.',
        [BusinessDataAttribute.ein]: '123-3243423',
      },
    });
    expect(state.context.data[BusinessDataAttribute.name]).toEqual('Acme Inc.');
    expect(state.context.data[BusinessDataAttribute.ein]).toEqual(
      '123-3243423',
    );

    expect(state.value).toEqual('businessAddress');
    state = machine.send('businessAddressSubmitted', {
      payload: {
        [BusinessDataAttribute.addressLine1]: '123 Main St',
        [BusinessDataAttribute.addressLine2]: 'Apt 1',
        [BusinessDataAttribute.city]: 'New York',
        [BusinessDataAttribute.state]: 'NY',
        [BusinessDataAttribute.country]: 'USA',
        [BusinessDataAttribute.zip]: '023123',
      },
    });
    expect(state.context.data[BusinessDataAttribute.addressLine1]).toEqual(
      '123 Main St',
    );
    expect(state.context.data[BusinessDataAttribute.addressLine2]).toEqual(
      'Apt 1',
    );
    expect(state.context.data[BusinessDataAttribute.city]).toEqual('New York');
    expect(state.context.data[BusinessDataAttribute.state]).toEqual('NY');
    expect(state.context.data[BusinessDataAttribute.country]).toEqual('USA');
    expect(state.context.data[BusinessDataAttribute.zip]).toEqual('023123');

    expect(state.value).toEqual('beneficialOwners');
    state = machine.send('beneficialOwnersSubmitted', {
      payload: {
        [BusinessDataAttribute.beneficialOwners]: [
          {
            [BeneficialOwnerDataAttribute.firstName]: 'John',
            [BeneficialOwnerDataAttribute.lastName]: 'Doey',
            [BeneficialOwnerDataAttribute.email]: 'john@gmail.com',
            [BeneficialOwnerDataAttribute.ownershipStake]: 30,
          },
          {
            [BeneficialOwnerDataAttribute.firstName]: 'Jane',
            [BeneficialOwnerDataAttribute.lastName]: 'Doe',
            [BeneficialOwnerDataAttribute.email]: 'jane@gmail.com',
            [BeneficialOwnerDataAttribute.ownershipStake]: 50,
          },
        ],
      },
    });
    expect(state.context.data[BusinessDataAttribute.beneficialOwners]).toEqual([
      {
        [BeneficialOwnerDataAttribute.firstName]: 'John',
        [BeneficialOwnerDataAttribute.lastName]: 'Doey',
        [BeneficialOwnerDataAttribute.email]: 'john@gmail.com',
        [BeneficialOwnerDataAttribute.ownershipStake]: 30,
      },
      {
        [BeneficialOwnerDataAttribute.firstName]: 'Jane',
        [BeneficialOwnerDataAttribute.lastName]: 'Doe',
        [BeneficialOwnerDataAttribute.email]: 'jane@gmail.com',
        [BeneficialOwnerDataAttribute.ownershipStake]: 50,
      },
    ]);
    expect(state.value).toEqual('confirm');

    state = machine.send({ type: 'confirmed' });

    expect(state.value).toEqual('beneficialOwnerKyc');
    state = machine.send({ type: 'beneficialOwnerKycSubmitted' });

    expect(state.value).toEqual('completed');
  });

  it('when there are no missing attributes', () => {
    const machine = createMachine([], []);
    const { state } = machine;
    expect(state.value).toEqual('completed');
  });

  it('skips pages when attributes are not missing', () => {
    const machine = createMachine([CollectedKybDataOption.address], []);

    let { state } = machine;
    expect(state.value).toEqual('introduction');
    state = machine.send('introductionCompleted');

    expect(state.value).toEqual('businessAddress');
    state = machine.send('businessAddressSubmitted', {
      payload: {
        [BusinessDataAttribute.addressLine1]: '123 Main St',
        [BusinessDataAttribute.addressLine2]: 'Apt 1',
        [BusinessDataAttribute.city]: 'New York',
        [BusinessDataAttribute.state]: 'NY',
        [BusinessDataAttribute.country]: 'USA',
        [BusinessDataAttribute.zip]: '023123',
      },
    });

    expect(state.context.data[BusinessDataAttribute.addressLine1]).toEqual(
      '123 Main St',
    );
    expect(state.context.data[BusinessDataAttribute.addressLine2]).toEqual(
      'Apt 1',
    );
    expect(state.context.data[BusinessDataAttribute.city]).toEqual('New York');
    expect(state.context.data[BusinessDataAttribute.state]).toEqual('NY');
    expect(state.context.data[BusinessDataAttribute.country]).toEqual('USA');
    expect(state.context.data[BusinessDataAttribute.zip]).toEqual('023123');

    expect(state.value).toEqual('confirm');

    state = machine.send({ type: 'confirmed' });
    expect(state.value).toEqual('completed');
  });

  describe('Confirm flow', () => {
    it('when on mobile', () => {
      const machine = createMachine(
        [
          CollectedKybDataOption.name,
          CollectedKybDataOption.ein,
          CollectedKybDataOption.address,
          CollectedKybDataOption.beneficialOwners,
        ],
        [],
      );
      let { state } = machine;

      // Collect all fields first
      state = machine.send('introductionCompleted');
      state = machine.send('basicDataSubmitted', {
        payload: {
          [BusinessDataAttribute.name]: 'Acme Inc.',
          [BusinessDataAttribute.ein]: '123-3243423',
        },
      });
      state = machine.send('businessAddressSubmitted', {
        payload: {
          [BusinessDataAttribute.addressLine1]: '123 Main St',
          [BusinessDataAttribute.addressLine2]: 'Apt 1',
          [BusinessDataAttribute.city]: 'New York',
          [BusinessDataAttribute.state]: 'NY',
          [BusinessDataAttribute.country]: 'USA',
          [BusinessDataAttribute.zip]: '023123',
        },
      });
      state = machine.send('beneficialOwnersSubmitted', {
        payload: {
          [BusinessDataAttribute.beneficialOwners]: [
            {
              [BeneficialOwnerDataAttribute.firstName]: 'John',
              [BeneficialOwnerDataAttribute.lastName]: 'Doey',
              [BeneficialOwnerDataAttribute.email]: 'john@gmail.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 30,
            },
            {
              [BeneficialOwnerDataAttribute.firstName]: 'Jane',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.email]: 'jane@gmail.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 50,
            },
          ],
        },
      });

      expect(state.value).toEqual('confirm');

      // On mobile, these events shouldn't trigger any state changes
      state = machine.send({ type: 'editBasicData' });
      expect(state.value).toEqual('confirm');
      state = machine.send({ type: 'editBusinessAddress' });
      expect(state.value).toEqual('confirm');
      state = machine.send({ type: 'editBeneficialOwners' });
      expect(state.value).toEqual('confirm');

      // On mobile, we should be able to edit the data from the confirm state
      state = machine.send({
        type: 'basicDataSubmitted',
        payload: {
          [BusinessDataAttribute.name]: 'New Biz.',
          [BusinessDataAttribute.ein]: '999999999',
        },
      });
      expect(state.context.data[BusinessDataAttribute.name]).toEqual(
        'New Biz.',
      );
      expect(state.context.data[BusinessDataAttribute.ein]).toEqual(
        '999999999',
      );
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'businessAddressSubmitted',
        payload: {
          [BusinessDataAttribute.addressLine1]: '222 Main St',
          [BusinessDataAttribute.addressLine2]: 'Apt 2',
          [BusinessDataAttribute.city]: 'Boston',
          [BusinessDataAttribute.state]: 'MA',
          [BusinessDataAttribute.country]: 'US',
          [BusinessDataAttribute.zip]: '023123',
        },
      });
      expect(state.context.data[BusinessDataAttribute.addressLine1]).toEqual(
        '222 Main St',
      );
      expect(state.context.data[BusinessDataAttribute.addressLine2]).toEqual(
        'Apt 2',
      );
      expect(state.context.data[BusinessDataAttribute.city]).toEqual('Boston');
      expect(state.context.data[BusinessDataAttribute.state]).toEqual('MA');
      expect(state.context.data[BusinessDataAttribute.country]).toEqual('US');
      expect(state.context.data[BusinessDataAttribute.zip]).toEqual('023123');
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'beneficialOwnersSubmitted',
        payload: {
          [BusinessDataAttribute.beneficialOwners]: [
            {
              [BeneficialOwnerDataAttribute.firstName]: 'Jake',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.email]: 'jake@gmail.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 20,
            },
            {
              [BeneficialOwnerDataAttribute.firstName]: 'Lilly',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.email]: 'lilly@gmail.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 40,
            },
          ],
        },
      });
      expect(
        state.context.data[BusinessDataAttribute.beneficialOwners],
      ).toEqual([
        {
          [BeneficialOwnerDataAttribute.firstName]: 'Jake',
          [BeneficialOwnerDataAttribute.lastName]: 'Doe',
          [BeneficialOwnerDataAttribute.email]: 'jake@gmail.com',
          [BeneficialOwnerDataAttribute.ownershipStake]: 20,
        },
        {
          [BeneficialOwnerDataAttribute.firstName]: 'Lilly',
          [BeneficialOwnerDataAttribute.lastName]: 'Doe',
          [BeneficialOwnerDataAttribute.email]: 'lilly@gmail.com',
          [BeneficialOwnerDataAttribute.ownershipStake]: 40,
        },
      ]);
      expect(state.value).toEqual('confirm');
    });

    it('when on desktop', () => {
      const machine = createMachine(
        [
          CollectedKybDataOption.name,
          CollectedKybDataOption.ein,
          CollectedKybDataOption.address,
          CollectedKybDataOption.beneficialOwners,
        ],
        [],
        {
          type: 'desktop',
          hasSupportForWebauthn: true,
        },
      );
      let { state } = machine;

      // Collect all fields first
      state = machine.send('introductionCompleted');
      state = machine.send('basicDataSubmitted', {
        payload: {
          [BusinessDataAttribute.name]: 'Acme Inc.',
          [BusinessDataAttribute.ein]: '123-3243423',
        },
      });
      state = machine.send('businessAddressSubmitted', {
        payload: {
          [BusinessDataAttribute.addressLine1]: '123 Main St',
          [BusinessDataAttribute.addressLine2]: 'Apt 1',
          [BusinessDataAttribute.city]: 'New York',
          [BusinessDataAttribute.state]: 'NY',
          [BusinessDataAttribute.country]: 'USA',
          [BusinessDataAttribute.zip]: '023123',
        },
      });
      state = machine.send('beneficialOwnersSubmitted', {
        payload: {
          [BusinessDataAttribute.beneficialOwners]: [
            {
              [BeneficialOwnerDataAttribute.firstName]: 'John',
              [BeneficialOwnerDataAttribute.lastName]: 'Doey',
              [BeneficialOwnerDataAttribute.email]: 'john@email.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 30,
            },
            {
              [BeneficialOwnerDataAttribute.firstName]: 'Jane',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.email]: 'jane@gmail.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 50,
            },
          ],
        },
      });

      expect(state.value).toEqual('confirm');

      // On desktop, these events shouldn't trigger any state changes
      state = machine.send({
        type: 'basicDataSubmitted',
        payload: {
          [BusinessDataAttribute.name]: 'New Biz.',
          [BusinessDataAttribute.ein]: '999999999',
        },
      });
      expect(state.value).toEqual('confirm');
      expect(state.context.data[BusinessDataAttribute.name]).toEqual(
        'Acme Inc.',
      );
      expect(state.context.data[BusinessDataAttribute.ein]).toEqual(
        '123-3243423',
      );

      state = machine.send({
        type: 'businessAddressSubmitted',
        payload: {
          [BusinessDataAttribute.addressLine1]: '222 Main St',
          [BusinessDataAttribute.addressLine2]: 'Apt 2',
          [BusinessDataAttribute.city]: 'Boston',
          [BusinessDataAttribute.state]: 'MA',
          [BusinessDataAttribute.country]: 'US',
          [BusinessDataAttribute.zip]: '023123',
        },
      });
      expect(state.value).toEqual('confirm');
      expect(state.context.data[BusinessDataAttribute.addressLine1]).toEqual(
        '123 Main St',
      );
      expect(state.context.data[BusinessDataAttribute.addressLine2]).toEqual(
        'Apt 1',
      );
      expect(state.context.data[BusinessDataAttribute.city]).toEqual(
        'New York',
      );
      expect(state.context.data[BusinessDataAttribute.state]).toEqual('NY');
      expect(state.context.data[BusinessDataAttribute.country]).toEqual('USA');
      expect(state.context.data[BusinessDataAttribute.zip]).toEqual('023123');

      state = machine.send({
        type: 'beneficialOwnersSubmitted',
        payload: {
          [BusinessDataAttribute.beneficialOwners]: [
            {
              [BeneficialOwnerDataAttribute.firstName]: 'Jake',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.email]: 'jake@gmail.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 20,
            },
            {
              [BeneficialOwnerDataAttribute.firstName]: 'Lilly',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.email]: 'lilly@gmail.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 40,
            },
          ],
        },
      });
      expect(state.value).toEqual('confirm');
      expect(
        state.context.data[BusinessDataAttribute.beneficialOwners],
      ).toEqual([
        {
          [BeneficialOwnerDataAttribute.firstName]: 'John',
          [BeneficialOwnerDataAttribute.lastName]: 'Doey',
          [BeneficialOwnerDataAttribute.email]: 'john@email.com',
          [BeneficialOwnerDataAttribute.ownershipStake]: 30,
        },
        {
          [BeneficialOwnerDataAttribute.firstName]: 'Jane',
          [BeneficialOwnerDataAttribute.lastName]: 'Doe',
          [BeneficialOwnerDataAttribute.email]: 'jane@gmail.com',
          [BeneficialOwnerDataAttribute.ownershipStake]: 50,
        },
      ]);

      // The following actions on desktop should take the user to edit states
      state = machine.send('editBasicData');
      expect(state.value).toEqual('basicDataEditDesktop');

      state = machine.send('returnToSummary');
      expect(state.value).toEqual('confirm');

      state = machine.send('editBusinessAddress');
      expect(state.value).toEqual('businessAddressEditDesktop');

      state = machine.send('returnToSummary');
      expect(state.value).toEqual('confirm');

      state = machine.send('editBeneficialOwners');
      expect(state.value).toEqual('beneficialOwnersEditDesktop');

      state = machine.send('returnToSummary');
      expect(state.value).toEqual('confirm');
    });
  });
});
