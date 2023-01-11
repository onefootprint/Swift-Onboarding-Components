import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';
import { interpret } from 'xstate';

import createOnboardingRequirementsMachine, {
  OnboardingRequirementsMachineArgs,
} from './machine';
import { Events, States } from './types';

describe('Onboarding Requirements Machine Tests', () => {
  const createMachine = (args: OnboardingRequirementsMachineArgs) =>
    createOnboardingRequirementsMachine(args);

  const TestOnboardingConfig: OnboardingConfig = {
    createdAt: 'date',
    id: 'id',
    isLive: true,
    key: 'key',
    logoUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: 'enabled',
    mustCollectData: [CollectedKycDataOption.name],
    mustCollectIdentityDocument: false,
    mustCollectSelfie: false,
    canAccessData: [CollectedKycDataOption.name],
    canAccessIdentityDocumentImages: false,
    canAccessSelfieImage: false,
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
        }),
      );

      machine.start();
      let { state } = machine;
      expect(state.value).toBe(States.checkOnboardingRequirements);
      const {
        requirements,
        kycData,
        startedDataCollection,
        onboardingContext,
      } = state.context;
      expect(requirements).toEqual({
        identityCheck: false,
        liveness: false,
        idDocRequestId: undefined,
        kycData: [],
      });
      expect(kycData).toEqual({});
      expect(startedDataCollection).toBe(false);
      expect(onboardingContext).toEqual({
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        userFound: true,
        authToken: 'token',
        config: { ...TestOnboardingConfig },
      });

      state = machine.send({
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: false,
          liveness: false,
          idDocRequestId: undefined,
          kycData: [],
        },
      });
      expect(state.value).toBe(States.success);
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
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: true,
          liveness: true,
          idDocRequestId: undefined,
          kycData: [CollectedKycDataOption.name],
        },
      });

      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: true,
        idDocRequestId: undefined,
        kycData: [CollectedKycDataOption.name],
      });
      expect(state.context.startedDataCollection).toBe(true);
      expect(state.value).toBe(States.additionalInfoRequired);

      // Skips the onboarding requirement checking after this
      state = machine.send({
        type: Events.requirementCompleted,
      });
      expect(state.value).toBe(States.kycData);

      state = machine.send({
        type: Events.requirementCompleted,
      });
      expect(state.value).toBe(States.checkOnboardingRequirements);

      state = machine.send({
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: true,
          liveness: true,
          idDocRequestId: undefined,
          kycData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: true,
        idDocRequestId: undefined,
        kycData: [],
      });

      expect(state.value).toBe(States.transfer);

      state = machine.send({
        type: Events.requirementCompleted,
      });
      expect(state.value).toBe(States.checkOnboardingRequirements);

      state = machine.send({
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: true,
          liveness: false,
          idDocRequestId: undefined,
          kycData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: false,
        idDocRequestId: undefined,
        kycData: [],
      });

      expect(state.value).toBe(States.identityCheck);

      state = machine.send({
        type: Events.requirementCompleted,
      });
      expect(state.value).toBe(States.checkOnboardingRequirements);

      state = machine.send({
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: false,
          liveness: false,
          idDocRequestId: undefined,
          kycData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: false,
        liveness: false,
        idDocRequestId: undefined,
        kycData: [],
      });
      expect(state.value).toBe(States.success);
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
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: true,
          liveness: false,
          idDocRequestId: undefined,
          kycData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: false,
        idDocRequestId: undefined,
        kycData: [],
      });

      expect(state.value).toBe(States.identityCheck);
      state = machine.send({
        type: Events.requirementCompleted,
      });
      expect(state.value).toBe(States.checkOnboardingRequirements);

      state = machine.send({
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: false,
          liveness: false,
          idDocRequestId: undefined,
          kycData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: false,
        liveness: false,
        idDocRequestId: undefined,
        kycData: [],
      });
      expect(state.value).toBe(States.success);
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
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: true,
          liveness: true,
          idDocRequestId: undefined,
          kycData: [CollectedKycDataOption.name],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: true,
        idDocRequestId: undefined,
        kycData: [CollectedKycDataOption.name],
      });

      expect(state.value).toBe(States.kycData);

      state = machine.send({
        type: Events.requirementCompleted,
      });
      expect(state.value).toBe(States.checkOnboardingRequirements);

      state = machine.send({
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: true,
          liveness: true,
          idDocRequestId: 'id',
          kycData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: true,
        idDocRequestId: 'id',
        kycData: [],
      });

      expect(state.value).toBe(States.transfer);

      state = machine.send({
        type: Events.requirementCompleted,
      });
      expect(state.value).toBe(States.checkOnboardingRequirements);

      state = machine.send({
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: true,
          liveness: false,
          idDocRequestId: undefined,
          kycData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: true,
        liveness: false,
        idDocRequestId: undefined,
        kycData: [],
      });

      expect(state.value).toBe(States.identityCheck);

      state = machine.send({
        type: Events.requirementCompleted,
      });
      expect(state.value).toBe(States.checkOnboardingRequirements);

      state = machine.send({
        type: Events.onboardingRequirementsReceived,
        payload: {
          identityCheck: false,
          liveness: false,
          idDocRequestId: undefined,
          kycData: [],
        },
      });
      expect(state.context.requirements).toEqual({
        identityCheck: false,
        liveness: false,
        idDocRequestId: undefined,
        kycData: [],
      });
      expect(state.value).toBe(States.success);
    });
  });
});
