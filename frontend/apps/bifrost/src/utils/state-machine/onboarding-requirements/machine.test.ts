import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';
import { interpret } from 'xstate';

import createOnboardingRequirementsMachine, {
  OnboardingRequirementsMachineArgs,
} from './machine';

describe('Onboarding Requirements Machine Tests', () => {
  const createMachine = (args: OnboardingRequirementsMachineArgs) =>
    createOnboardingRequirementsMachine(args);

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

  describe('with an existing user', () => {
    it('successfully completes when requirements are empty', () => {
      const machine = interpret(
        createMachine({
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
          userFound: true,
          authToken: 'token',
          config: { ...TestOnboardingConfig },
          email: 'piip@onefootprint.com',
          sandboxSuffix: 'sandboxTest',
        }),
      );

      machine.start();
      let { state } = machine;
      expect(state.value).toBe('checkOnboardingRequirements');
      const { requirements, startedDataCollection, onboardingContext } =
        state.context;
      expect(requirements).toEqual({
        identityCheck: false,
        liveness: false,
        idDoc: false,
        kycData: [],
        kybData: [],
      });
      expect(startedDataCollection).toBe(false);
      expect(onboardingContext).toEqual({
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        userFound: true,
        authToken: 'token',
        config: { ...TestOnboardingConfig },
        email: 'piip@onefootprint.com',
        sandboxSuffix: 'sandboxTest',
      });

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: false,
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
        },
      });
      expect(state.value).toBe('success');
    });

    it('shows additional data required page for data collection requirements', () => {
      const machine = interpret(
        createMachine({
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
          userFound: true,
          authToken: 'token',
          config: { ...TestOnboardingConfig },
        }),
      );

      machine.start();
      let { state } = machine;

      expect(state.context.startedDataCollection).toBe(false);
      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: true,
          liveness: true,
          idDoc: false,
          kycData: [CollectedKycDataOption.name],
          kybData: [],
        },
      });

      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: true,
        idDoc: false,
        kycData: [CollectedKycDataOption.name],
        kybData: [],
      });
      expect(state.context.startedDataCollection).toBe(true);
      expect(state.value).toBe('additionalInfoRequired');

      // Skips the onboarding requirement checking after this
      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('kycData');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: true,
          liveness: true,
          idDoc: false,
          kycData: [],
          kybData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: true,
        idDoc: false,
        kycData: [],
        kybData: [],
      });

      expect(state.value).toBe('transfer');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: true,
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: false,
        idDoc: false,
        kycData: [],
        kybData: [],
      });

      expect(state.value).toBe('identityCheck');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: false,
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: false,
        liveness: false,
        idDoc: false,
        kycData: [],
        kybData: [],
      });
      expect(state.value).toBe('success');
    });

    it('skips the additional data required page if only identity check is required', () => {
      const machine = interpret(
        createMachine({
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
          userFound: true,
          authToken: 'token',
          config: { ...TestOnboardingConfig },
        }),
      );

      machine.start();
      let { state } = machine;
      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: true,
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: false,
        idDoc: false,
        kycData: [],
        kybData: [],
      });

      expect(state.value).toBe('identityCheck');
      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: false,
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: false,
        liveness: false,
        idDoc: false,
        kycData: [],
        kybData: [],
      });
      expect(state.value).toBe('success');
    });
  });

  describe('with a new user', () => {
    it('successfully completes requirements and step up with id doc', () => {
      const machine = interpret(
        createMachine({
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
          userFound: false,
          authToken: 'token',
          config: { ...TestOnboardingConfig },
        }),
      );

      machine.start();
      let { state } = machine;
      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: true,
          liveness: true,
          idDoc: false,
          kycData: [CollectedKycDataOption.name],
          kybData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: true,
        idDoc: false,
        kycData: [CollectedKycDataOption.name],
        kybData: [],
      });

      expect(state.value).toBe('kycData');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: true,
          liveness: true,
          idDoc: true,
          kycData: [],
          kybData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: true,
        idDoc: true,
        kycData: [],
        kybData: [],
      });

      expect(state.value).toBe('transfer');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: true,
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: false,
        idDoc: false,
        kycData: [],
        kybData: [],
      });

      expect(state.value).toBe('identityCheck');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          identityCheck: false,
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: false,
        liveness: false,
        idDoc: false,
        kycData: [],
        kybData: [],
      });
      expect(state.value).toBe('success');
    });
  });
});
