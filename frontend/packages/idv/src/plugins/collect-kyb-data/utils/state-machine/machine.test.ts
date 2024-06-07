import type { PublicOnboardingConfig } from '@onefootprint/types';
import {
  BeneficialOwnerDataAttribute,
  BusinessDI,
  CollectedKybDataOption,
  CollectedKycDataOption,
  OnboardingConfigStatus,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import createCollectKybDataMachine from './machine';
import type { MachineContext } from './types';

describe('Collect KYB Data Machine Tests', () => {
  const TestOnboardingConfig: PublicOnboardingConfig = {
    isLive: true,
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    orgId: 'orgId',
    status: OnboardingConfigStatus.enabled,
    isAppClipEnabled: false,
    isInstantAppEnabled: false,
    appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
    isNoPhoneFlow: false,
    requiresIdDoc: false,
    key: 'key',
    isKyb: false,
    allowInternationalResidents: false,
  };

  const createMachine = (
    missingKybAttributes: CollectedKybDataOption[],
    missingKycAttributes: CollectedKycDataOption[],
    device: DeviceInfo = {
      type: 'desktop',
      hasSupportForWebauthn: false,
      osName: 'Windows',
      browser: 'Chrome',
    },
  ) => {
    const initialContext: MachineContext = {
      idvContext: {
        authToken: 'authToken',
        device,
      },
      config: { ...TestOnboardingConfig },
      kybRequirement: {
        kind: OnboardingRequirementKind.collectKybData,
        isMet: false,
        missingAttributes: missingKybAttributes,
      },
      kycRequirement: {
        kind: OnboardingRequirementKind.collectKycData,
        isMet: false,
        missingAttributes: missingKycAttributes,
        populatedAttributes: [],
        optionalAttributes: [],
      },
      kycUserData: {},
      data: {},
    };

    const machine = interpret(createCollectKybDataMachine(initialContext));
    machine.start();
    return machine;
  };

  it('visits all pages when all attributes are missing', () => {
    const machine = createMachine(
      [
        CollectedKybDataOption.name,
        CollectedKybDataOption.tin,
        CollectedKybDataOption.address,
        CollectedKybDataOption.beneficialOwners,
      ],
      [CollectedKycDataOption.name, CollectedKycDataOption.address],
    );
    let { state } = machine;

    expect(state.value).toEqual('introduction');
    state = machine.send('introductionCompleted');
    expect(state.value).toEqual('basicData');

    state = machine.send({
      type: 'navigatedToPrevPage',
    });
    expect(state.value).toEqual('introduction');
    state = machine.send('introductionCompleted');
    expect(state.value).toEqual('basicData');

    state = machine.send('basicDataSubmitted', {
      payload: {
        [BusinessDI.name]: 'Acme Inc.',
        [BusinessDI.tin]: '123-3243423',
      },
    });
    expect(state.context.data[BusinessDI.name]).toEqual('Acme Inc.');
    expect(state.context.data[BusinessDI.tin]).toEqual('123-3243423');

    expect(state.value).toEqual('businessAddress');
    state = machine.send({
      type: 'navigatedToPrevPage',
    });
    expect(state.value).toEqual('basicData');
    state = machine.send('basicDataSubmitted', {
      payload: {
        [BusinessDI.name]: 'Acme Inc.',
        [BusinessDI.tin]: '123-3243423',
      },
    });
    expect(state.value).toEqual('businessAddress');

    state = machine.send('businessAddressSubmitted', {
      payload: {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Apt 1',
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.country]: 'USA',
        [BusinessDI.zip]: '023123',
      },
    });
    expect(state.context.data[BusinessDI.addressLine1]).toEqual('123 Main St');
    expect(state.context.data[BusinessDI.addressLine2]).toEqual('Apt 1');
    expect(state.context.data[BusinessDI.city]).toEqual('New York');
    expect(state.context.data[BusinessDI.state]).toEqual('NY');
    expect(state.context.data[BusinessDI.country]).toEqual('USA');
    expect(state.context.data[BusinessDI.zip]).toEqual('023123');

    expect(state.value).toEqual('beneficialOwners');
    state = machine.send({
      type: 'navigatedToPrevPage',
    });
    expect(state.value).toEqual('businessAddress');
    state = machine.send('businessAddressSubmitted', {
      payload: {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Apt 1',
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.country]: 'USA',
        [BusinessDI.zip]: '023123',
      },
    });
    expect(state.value).toEqual('beneficialOwners');

    state = machine.send('beneficialOwnersSubmitted', {
      payload: {
        [BusinessDI.beneficialOwners]: [
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
    expect(state.context.data[BusinessDI.beneficialOwners]).toEqual([
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
    state = machine.send({
      type: 'navigatedToPrevPage',
    });
    expect(state.value).toEqual('beneficialOwners');
    state = machine.send('beneficialOwnersSubmitted', {
      payload: {
        [BusinessDI.beneficialOwners]: [
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
    state = machine.send({
      type: 'navigatedToPrevPage',
    });
    expect(state.value).toEqual('introduction');
    state = machine.send('introductionCompleted');
    expect(state.value).toEqual('businessAddress');

    state = machine.send('businessAddressSubmitted', {
      payload: {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Apt 1',
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.country]: 'USA',
        [BusinessDI.zip]: '023123',
      },
    });

    expect(state.context.data[BusinessDI.addressLine1]).toEqual('123 Main St');
    expect(state.context.data[BusinessDI.addressLine2]).toEqual('Apt 1');
    expect(state.context.data[BusinessDI.city]).toEqual('New York');
    expect(state.context.data[BusinessDI.state]).toEqual('NY');
    expect(state.context.data[BusinessDI.country]).toEqual('USA');
    expect(state.context.data[BusinessDI.zip]).toEqual('023123');

    expect(state.value).toEqual('confirm');
    state = machine.send({
      type: 'navigatedToPrevPage',
    });
    expect(state.value).toEqual('businessAddress');
    state = machine.send('businessAddressSubmitted', {
      payload: {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Apt 1',
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.country]: 'USA',
        [BusinessDI.zip]: '023123',
      },
    });
    expect(state.value).toEqual('confirm');

    state = machine.send({ type: 'confirmed' });

    expect(state.value).toEqual('beneficialOwnerKyc');
    state = machine.send({ type: 'beneficialOwnerKycSubmitted' });

    expect(state.value).toEqual('completed');
  });

  describe('Confirm flow', () => {
    it('Can edit from confirm state', () => {
      const machine = createMachine(
        [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
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
          [BusinessDI.name]: 'Acme Inc.',
          [BusinessDI.tin]: '123-3243423',
        },
      });
      state = machine.send('businessAddressSubmitted', {
        payload: {
          [BusinessDI.addressLine1]: '123 Main St',
          [BusinessDI.addressLine2]: 'Apt 1',
          [BusinessDI.city]: 'New York',
          [BusinessDI.state]: 'NY',
          [BusinessDI.country]: 'USA',
          [BusinessDI.zip]: '023123',
        },
      });
      state = machine.send('beneficialOwnersSubmitted', {
        payload: {
          [BusinessDI.beneficialOwners]: [
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

      // These events shouldn't trigger any state changes
      state = machine.send({ type: 'editBasicData' });
      expect(state.value).toEqual('confirm');
      state = machine.send({ type: 'editBusinessAddress' });
      expect(state.value).toEqual('confirm');
      state = machine.send({ type: 'editBeneficialOwners' });
      expect(state.value).toEqual('confirm');

      // We should be able to edit the data from the confirm state
      state = machine.send({
        type: 'basicDataSubmitted',
        payload: {
          [BusinessDI.name]: 'New Biz.',
          [BusinessDI.tin]: '999999999',
        },
      });
      expect(state.context.data[BusinessDI.name]).toEqual('New Biz.');
      expect(state.context.data[BusinessDI.tin]).toEqual('999999999');
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'businessAddressSubmitted',
        payload: {
          [BusinessDI.addressLine1]: '222 Main St',
          [BusinessDI.addressLine2]: 'Apt 2',
          [BusinessDI.city]: 'Boston',
          [BusinessDI.state]: 'MA',
          [BusinessDI.country]: 'US',
          [BusinessDI.zip]: '023123',
        },
      });
      expect(state.context.data[BusinessDI.addressLine1]).toEqual('222 Main St');
      expect(state.context.data[BusinessDI.addressLine2]).toEqual('Apt 2');
      expect(state.context.data[BusinessDI.city]).toEqual('Boston');
      expect(state.context.data[BusinessDI.state]).toEqual('MA');
      expect(state.context.data[BusinessDI.country]).toEqual('US');
      expect(state.context.data[BusinessDI.zip]).toEqual('023123');
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'beneficialOwnersSubmitted',
        payload: {
          [BusinessDI.beneficialOwners]: [
            {
              [BeneficialOwnerDataAttribute.firstName]: 'Jake',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.email]: 'jake@gmail.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 20,
              [BeneficialOwnerDataAttribute.phoneNumber]: '1234567890',
            },
            {
              [BeneficialOwnerDataAttribute.firstName]: 'Lilly',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.email]: 'lilly@gmail.com',
              [BeneficialOwnerDataAttribute.ownershipStake]: 40,
              [BeneficialOwnerDataAttribute.phoneNumber]: '1234567890',
            },
          ],
        },
      });
      expect(state.context.data[BusinessDI.beneficialOwners]).toEqual([
        {
          [BeneficialOwnerDataAttribute.firstName]: 'Jake',
          [BeneficialOwnerDataAttribute.lastName]: 'Doe',
          [BeneficialOwnerDataAttribute.email]: 'jake@gmail.com',
          [BeneficialOwnerDataAttribute.ownershipStake]: 20,
          [BeneficialOwnerDataAttribute.phoneNumber]: '1234567890',
        },
        {
          [BeneficialOwnerDataAttribute.firstName]: 'Lilly',
          [BeneficialOwnerDataAttribute.lastName]: 'Doe',
          [BeneficialOwnerDataAttribute.email]: 'lilly@gmail.com',
          [BeneficialOwnerDataAttribute.ownershipStake]: 40,
          [BeneficialOwnerDataAttribute.phoneNumber]: '1234567890',
        },
      ]);
      expect(state.value).toEqual('confirm');
    });
  });
});
