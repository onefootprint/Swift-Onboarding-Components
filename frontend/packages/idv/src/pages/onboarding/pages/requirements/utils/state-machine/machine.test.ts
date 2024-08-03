import type {
  AuthorizeRequirement,
  CollectKycDataRequirement,
  PublicOnboardingConfig,
  RegisterPasskeyRequirement,
} from '@onefootprint/types';
import { CollectedKycDataOption, IdDI, OnboardingConfigStatus, OnboardingRequirementKind } from '@onefootprint/types';
import { interpret } from 'xstate';

import { idDocRequirement } from 'src/idv.test';
import type { OnboardingRequirementsMachineArgs } from './machine';
import createOnboardingRequirementsMachine from './machine';

const livenessRequirement: RegisterPasskeyRequirement = {
  kind: OnboardingRequirementKind.registerPasskey,
  isMet: false,
};

const kycRequirement: CollectKycDataRequirement = {
  kind: OnboardingRequirementKind.collectKycData,
  isMet: false,
  missingAttributes: [CollectedKycDataOption.name],
  populatedAttributes: [],
  optionalAttributes: [],
};

const authorizeRequirement: AuthorizeRequirement = {
  kind: OnboardingRequirementKind.authorize,
  isMet: false,
  fieldsToAuthorize: {
    collectedData: [CollectedKycDataOption.name],
    documentTypes: [],
  },
} as AuthorizeRequirement;

describe('Onboarding Requirements Machine Tests', () => {
  const createMachine = (args: OnboardingRequirementsMachineArgs) => createOnboardingRequirementsMachine(args);

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

  const NoPhoneOnboardingConfig: PublicOnboardingConfig = {
    ...TestOnboardingConfig,
    isNoPhoneFlow: true,
  };

  describe('with an existing user', () => {
    it('successfully completes when requirements are empty', () => {
      const machine = interpret(
        createMachine({
          idvContext: {
            device: {
              type: 'mobile',
              hasSupportForWebauthn: true,
              osName: 'unknown',
              browser: 'Safari',
            },
            authToken: 'token',
          },
          config: TestOnboardingConfig,
          bootstrapData: {
            [IdDI.email]: {
              value: 'piip@onefootprint.com',
              isBootstrap: true,
            },
          },
        }),
      );

      machine.start();
      let { state } = machine;
      expect(state.value).toBe('startOnboarding');

      state = machine.send({
        type: 'initialized',
      });
      expect(state.value).toBe('checkRequirements');
      const { idvContext, isRequirementRouterVisited, onboardingContext, requirements } = state.context;
      expect(requirements).toEqual([]);
      expect(isRequirementRouterVisited).toBe(false);
      expect(onboardingContext).toEqual({
        config: TestOnboardingConfig,
        bootstrapData: {
          [IdDI.email]: {
            value: 'piip@onefootprint.com',
            isBootstrap: true,
          },
        },
      });
      expect(idvContext).toEqual({
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
          osName: 'unknown',
          browser: 'Safari',
        },
        authToken: 'token',
      });

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [],
      });
      expect(state.value).toBe('success');
    });
  });

  describe('with a new user', () => {
    it('successfully completes requirements and step up with id doc', () => {
      const machine = interpret(
        createMachine({
          idvContext: {
            device: {
              type: 'mobile',
              hasSupportForWebauthn: true,
              osName: 'unknown',
              browser: 'Safari',
            },
            authToken: 'token',
          },
          config: TestOnboardingConfig,
          bootstrapData: {},
        }),
      );

      machine.start();
      let { state } = machine;
      expect(state.value).toBe('startOnboarding');

      state = machine.send({
        type: 'initialized',
      });
      expect(state.value).toBe('checkRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [kycRequirement, livenessRequirement, authorizeRequirement],
      });
      expect(state.context.requirements).toEqual([kycRequirement, livenessRequirement, authorizeRequirement]);
      expect(state.value).toBe('kycData');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [livenessRequirement, idDocRequirement, authorizeRequirement],
      });
      expect(state.context.requirements).toEqual([livenessRequirement, idDocRequirement, authorizeRequirement]);

      expect(state.value).toBe('liveness');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [authorizeRequirement],
      });

      expect(state.value).toBe('authorize');
      expect(state.context.requirements).toEqual([authorizeRequirement]);

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [],
      });
      expect(state.value).toBe('success');
    });
  });

  describe('Additional cases', () => {
    it('Skips transfer when it is a no phone flow', () => {
      const machine = interpret(
        createMachine({
          idvContext: {
            device: {
              type: 'mobile',
              hasSupportForWebauthn: true,
              osName: 'unknown',
              browser: 'Safari',
            },
            authToken: 'token',
          },
          config: NoPhoneOnboardingConfig,
          bootstrapData: {},
        }),
      );

      machine.start();
      let { state } = machine;
      expect(state.value).toBe('startOnboarding');

      state = machine.send({
        type: 'initialized',
      });
      expect(state.value).toBe('checkRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [kycRequirement, livenessRequirement, authorizeRequirement],
      });
      expect(state.context.requirements).toEqual([kycRequirement, livenessRequirement, authorizeRequirement]);

      expect(state.value).toBe('kycData');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [livenessRequirement, idDocRequirement, authorizeRequirement],
      });
      expect(state.context.requirements).toEqual([livenessRequirement, idDocRequirement, authorizeRequirement]);

      expect(state.value).toBe('liveness');
    });

    it('Skips initializing onboarding for transfer', () => {
      const machine = interpret(
        createMachine({
          idvContext: {
            device: {
              type: 'mobile',
              hasSupportForWebauthn: true,
              osName: 'unknown',
              browser: 'Safari',
            },
            authToken: 'token',
            isTransfer: true,
          },
          config: NoPhoneOnboardingConfig,
          bootstrapData: {},
        }),
      );

      machine.start();
      const { state } = machine;

      expect(state.value).toBe('checkRequirements');
    });
  });
});
