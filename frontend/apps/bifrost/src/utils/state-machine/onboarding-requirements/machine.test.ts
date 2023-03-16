import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';
import { interpret } from 'xstate';

import createOnboardingRequirementsMachine, {
  OnboardingRequirementsMachineArgs,
} from './machine';

/*
  TODO:
  - add tests for kyb and investorProfile
*/

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
        liveness: false,
        idDoc: false,
        kycData: [],
        kybData: [],
        investorProfile: [],
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
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
          investorProfile: [],
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
          liveness: true,
          idDoc: false,
          kycData: [CollectedKycDataOption.name],
          kybData: [],
          investorProfile: [],
        },
      });

      expect(state.context.requirements).toEqual({
        liveness: true,
        idDoc: false,
        kycData: [CollectedKycDataOption.name],
        kybData: [],
        investorProfile: [],
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
          liveness: true,
          idDoc: false,
          kycData: [],
          kybData: [],
          investorProfile: [],
        },
      });
      expect(state.context.requirements).toEqual({
        liveness: true,
        idDoc: false,
        kycData: [],
        kybData: [],
        investorProfile: [],
      });

      expect(state.value).toBe('transfer');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
          investorProfile: [],
        },
      });
      expect(state.context.requirements).toEqual({
        idDoc: false,
        kycData: [],
        kybData: [],
        investorProfile: [],
        liveness: false,
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
          liveness: true,
          idDoc: false,
          kycData: [CollectedKycDataOption.name],
          kybData: [],
          investorProfile: [],
        },
      });
      expect(state.context.requirements).toEqual({
        liveness: true,
        idDoc: false,
        kycData: [CollectedKycDataOption.name],
        kybData: [],
        investorProfile: [],
      });

      expect(state.value).toBe('kycData');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          liveness: true,
          idDoc: true,
          kycData: [],
          kybData: [],
          investorProfile: [],
        },
      });
      expect(state.context.requirements).toEqual({
        liveness: true,
        idDoc: true,
        kycData: [],
        kybData: [],
        investorProfile: [],
      });

      expect(state.value).toBe('transfer');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkOnboardingRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: {
          liveness: false,
          idDoc: false,
          kycData: [],
          kybData: [],
          investorProfile: [],
        },
      });
      expect(state.context.requirements).toEqual({
        liveness: false,
        idDoc: false,
        kycData: [],
        kybData: [],
        investorProfile: [],
      });

      expect(state.value).toBe('success');
    });
  });
});
