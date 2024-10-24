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

import type { DeviceInfo } from '../../../../hooks';
import createCollectKybDataMachine, { nextScreenTransitions, getDataCollectionScreensToShow } from './machine';
import type { BeneficialOwnersData, MachineContext } from './types';

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

describe('Collect KYB Data Machine Tests', () => {
  const createMachine = (
    missingKybAttributes: CollectedKybDataOption[],
    missingKycAttributes: CollectedKycDataOption[],
    populatedKybAttributes: CollectedKybDataOption[] = [],
    recollectKybAttributes: CollectedKybDataOption[] = [],
    device: DeviceInfo = {
      type: 'desktop',
      hasSupportForWebauthn: false,
      osName: 'Windows',
      browser: 'Chrome',
    },
    additionalConfig?: Partial<PublicOnboardingConfig>,
  ) => {
    const initialContext: MachineContext = {
      idvContext: {
        authToken: 'authToken',
        device,
      },
      config: { ...TestOnboardingConfig, ...additionalConfig },
      kybRequirement: {
        kind: OnboardingRequirementKind.collectKybData,
        isMet: false,
        missingAttributes: missingKybAttributes,
        hasLinkedBos: false,
        populatedAttributes: populatedKybAttributes,
        recollectAttributes: recollectKybAttributes,
      },
      kycRequirement: {
        kind: OnboardingRequirementKind.collectKycData,
        isMet: false,
        missingAttributes: missingKycAttributes,
        populatedAttributes: [],
        optionalAttributes: [],
        recollectAttributes: [],
      },
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    };

    const machine = interpret(createCollectKybDataMachine(initialContext));
    machine.start();
    return machine;
  };

  it('shows page when recollect attributes are present', () => {
    const attrs = [CollectedKybDataOption.kycedBeneficialOwners];
    const machine = createMachine([], [], attrs, attrs);

    let { state } = machine;
    expect(state.value).toEqual('loadFromVault');
    state = machine.send({ type: 'businessDataLoadSuccess', payload: { data: {}, vaultBusinessData: {} } });
    expect(state.value).toEqual('manageBos');
  });

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

    expect(state.value).toEqual('loadFromVault');
    state = machine.send('businessDataLoadError');

    expect(state.value).toEqual('introduction');
    state = machine.send('introductionCompleted');
    expect(state.value).toEqual('basicData');

    state = machine.send({ type: 'navigatedToPrevPage' });
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

    state = machine.send({ type: 'navigatedToPrevPage' });
    expect(state.value).toEqual('basicData');

    state = machine.send({ type: 'navigatedToPrevPage' });
    expect(state.value).toEqual('introduction');

    state = machine.send('introductionCompleted');
    expect(state.value).toEqual('basicData');

    state = machine.send('basicDataSubmitted', {});
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

    state = machine.send('beneficialOwnersSubmitted', {
      payload: {
        data: {
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
        vaultBusinessData: {} as BeneficialOwnersData,
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
    state = machine.send({ type: 'navigatedToPrevPage' });

    expect(state.value).toEqual('beneficialOwners');
    state = machine.send({ type: 'navigatedToPrevPage' });

    expect(state.value).toEqual('businessAddress');
    state = machine.send({ type: 'navigatedToPrevPage' });

    expect(state.value).toEqual('basicData');
    state = machine.send({ type: 'navigatedToPrevPage' });

    expect(state.value).toEqual('introduction');
    state = machine.send('introductionCompleted');

    expect(state.value).toEqual('basicData');
    state = machine.send('basicDataSubmitted', {});

    expect(state.value).toEqual('businessAddress');
    state = machine.send('businessAddressSubmitted', {});

    expect(state.value).toEqual('beneficialOwners');
    state = machine.send({
      type: 'beneficialOwnersSubmitted',
      payload: {
        data: {} as BeneficialOwnersData,
        vaultBusinessData: {} as BeneficialOwnersData,
      },
    });
    expect(state.value).toEqual('confirm');

    state = machine.send({ type: 'confirmed' });
    expect(state.value).toEqual('beneficialOwnerKyc');

    state = machine.send({ type: 'beneficialOwnerKycSubmitted' });
    expect(state.value).toEqual('completed');
    expect(state.done).toEqual(true);
  });

  it('when there are no missing attributes with success load', () => {
    const machine = createMachine([], []);
    let { state } = machine;
    expect(state.value).toEqual('loadFromVault');

    state = machine.send({ type: 'businessDataLoadSuccess', payload: { data: {}, vaultBusinessData: {} } });
    expect(state.value).toEqual('confirm');
  });

  it('when there are no missing attributes with failure load', () => {
    const machine = createMachine([], []);
    let { state } = machine;
    expect(state.value).toEqual('loadFromVault');

    state = machine.send({ type: 'businessDataLoadError' });
    expect(state.value).toEqual('confirm');
  });

  it('skips pages when attributes are not missing', () => {
    const machine = createMachine([CollectedKybDataOption.address], []);

    let { state } = machine;
    expect(state.value).toEqual('loadFromVault');

    state = machine.send({ type: 'businessDataLoadSuccess', payload: { data: {}, vaultBusinessData: {} } });
    expect(state.value).toEqual('introduction');

    state = machine.send('introductionCompleted');
    expect(state.value).toEqual('businessAddress');

    state = machine.send({ type: 'navigatedToPrevPage' });
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

    state = machine.send({ type: 'navigatedToPrevPage' });
    expect(state.value).toEqual('businessAddress');

    state = machine.send({ type: 'navigatedToPrevPage' });
    expect(state.value).toEqual('introduction');

    state = machine.send('introductionCompleted');
    expect(state.value).toEqual('businessAddress');

    state = machine.send('businessAddressSubmitted', {});
    expect(state.value).toEqual('confirm');

    state = machine.send({ type: 'confirmed' });
    expect(state.value).toEqual('beneficialOwnerKyc');

    state = machine.send({ type: 'beneficialOwnerKycSubmitted' });
    expect(state.value).toEqual('completed');
    expect(state.done).toEqual(true);
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

      expect(state.value).toEqual('loadFromVault');
      state = machine.send({ type: 'businessDataLoadSuccess', payload: { data: {}, vaultBusinessData: {} } });

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
          data: {
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
          vaultBusinessData: {} as BeneficialOwnersData,
        },
      });

      expect(state.value).toEqual('confirm');

      // These events shouldn't trigger any state changes
      // @ts-expect-error: event doesn't exist
      state = machine.send({ type: 'unknownEvent' });
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
          data: {
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
          vaultBusinessData: {} as BeneficialOwnersData,
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

    it('should start with invisible confirm screen, after confirm error shows the confirm screen', () => {
      const machine = createMachine(
        [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.address,
          CollectedKybDataOption.beneficialOwners,
        ],
        [],
        [],
        [],
        { type: 'desktop', hasSupportForWebauthn: false, osName: 'Windows', browser: 'Chrome' },
        { skipConfirm: true },
      );
      let { state } = machine;

      expect(state.value).toEqual('loadFromVault');
      state = machine.send({ type: 'businessDataLoadSuccess', payload: { data: {}, vaultBusinessData: {} } });

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
          data: {
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
          vaultBusinessData: {} as BeneficialOwnersData,
        },
      });

      expect(state.value).toEqual('confirm');
      expect(state.context.isConfirmScreenVisible).toEqual(false);
    });
  });
});

describe('nextScreenTransitions', () => {
  const Targets = ['introduction', 'basicData', 'businessAddress', 'manageBos', 'beneficialOwners', 'confirm'];

  it('should return same targets when loadFromVault', () => {
    const result = nextScreenTransitions('loadFromVault');
    expect(result.map(x => x.target)).toEqual(Targets);
  });

  it('should return same targets when introduction', () => {
    const result = nextScreenTransitions('introduction');
    expect(result.map(x => x.target)).toEqual(Targets);
  });

  it('should return same targets when basicData', () => {
    const result = nextScreenTransitions('basicData');
    expect(result.map(x => x.target)).toEqual(Targets);
  });

  it('should return same targets when businessAddress', () => {
    const result = nextScreenTransitions('businessAddress');
    expect(result.map(x => x.target)).toEqual(Targets);
  });

  it('should return same targets when beneficialOwners', () => {
    const result = nextScreenTransitions('beneficialOwners');
    expect(result.map(x => x.target)).toEqual(Targets);
  });

  it('should return same targets when confirm', () => {
    const result = nextScreenTransitions('confirm');
    expect(result.map(x => x.target)).toEqual(Targets);
  });
});

describe('getDataCollectionScreensToShow', () => {
  const baseCtx: MachineContext = {
    idvContext: {
      authToken: 'authToken',
      device: { type: 'desktop', hasSupportForWebauthn: false, osName: 'Windows', browser: 'Chrome' },
    },
    config: { ...TestOnboardingConfig },
    kybRequirement: {
      kind: OnboardingRequirementKind.collectKybData,
      isMet: false,
      missingAttributes: [],
      hasLinkedBos: false,
      recollectAttributes: [],
      populatedAttributes: [],
    },
    kycRequirement: {
      kind: OnboardingRequirementKind.collectKycData,
      isMet: false,
      missingAttributes: [],
      populatedAttributes: [],
      optionalAttributes: [],
      recollectAttributes: [],
    },
    bootstrapBusinessData: {},
    bootstrapUserData: {},
    data: {},
    dataCollectionScreensToShow: [],
    isConfirmScreenVisible: true,
  };

  it('should return introduction, basicData, confirm 1/5', () => {
    const ctx = {
      ...baseCtx,
      kybRequirement: {
        ...baseCtx.kybRequirement,
        missingAttributes: [CollectedKybDataOption.name],
      },
    } as MachineContext;

    expect(getDataCollectionScreensToShow(ctx)).toEqual(['introduction', 'basicData', 'confirm']);
  });

  it('should return introduction, basicData, confirm 2/5', () => {
    const ctx = {
      ...baseCtx,
      kybRequirement: {
        ...baseCtx.kybRequirement,
        missingAttributes: [CollectedKybDataOption.tin],
      },
    } as MachineContext;

    expect(getDataCollectionScreensToShow(ctx)).toEqual(['introduction', 'basicData', 'confirm']);
  });

  it('should return introduction, basicData, confirm 3/5', () => {
    const ctx = {
      ...baseCtx,
      kybRequirement: {
        ...baseCtx.kybRequirement,
        missingAttributes: [CollectedKybDataOption.phoneNumber],
      },
    } as MachineContext;

    expect(getDataCollectionScreensToShow(ctx)).toEqual(['introduction', 'basicData', 'confirm']);
  });

  it('should return introduction, basicData, confirm 4/5', () => {
    const ctx = {
      ...baseCtx,
      kybRequirement: {
        ...baseCtx.kybRequirement,
        missingAttributes: [CollectedKybDataOption.website],
      },
    } as MachineContext;

    expect(getDataCollectionScreensToShow(ctx)).toEqual(['introduction', 'basicData', 'confirm']);
  });

  it('should return introduction, basicData, confirm 5/5', () => {
    const ctx = {
      ...baseCtx,
      kybRequirement: {
        ...baseCtx.kybRequirement,
        missingAttributes: [CollectedKybDataOption.corporationType],
      },
    } as MachineContext;

    expect(getDataCollectionScreensToShow(ctx)).toEqual(['introduction', 'basicData', 'confirm']);
  });

  it('should return introduction, businessAddress, confirm', () => {
    const ctx = {
      ...baseCtx,
      kybRequirement: {
        ...baseCtx.kybRequirement,
        missingAttributes: [CollectedKybDataOption.address],
      },
    } as MachineContext;

    expect(getDataCollectionScreensToShow(ctx)).toEqual(['introduction', 'businessAddress', 'confirm']);
  });

  it('should return introduction, beneficialOwners, confirm 1/2', () => {
    const ctx = {
      ...baseCtx,
      kybRequirement: {
        ...baseCtx.kybRequirement,
        missingAttributes: [CollectedKybDataOption.beneficialOwners],
      },
    } as MachineContext;

    expect(getDataCollectionScreensToShow(ctx)).toEqual(['introduction', 'beneficialOwners', 'confirm']);
  });

  it('should return introduction, beneficialOwners, confirm 2/2', () => {
    const ctx = {
      ...baseCtx,
      kybRequirement: {
        ...baseCtx.kybRequirement,
        missingAttributes: [CollectedKybDataOption.kycedBeneficialOwners],
      },
    } as MachineContext;

    expect(getDataCollectionScreensToShow(ctx)).toEqual(['introduction', 'beneficialOwners', 'confirm']);
  });

  it('should return confirm', () => {
    expect(getDataCollectionScreensToShow(baseCtx)).toEqual(['confirm']);
  });
});
