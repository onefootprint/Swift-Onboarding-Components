import {
  AuthorizeRequirement,
  CollectedKycDataOption,
  CollectKycDataRequirement,
  IdDI,
  IdDocRequirement,
  OnboardingConfig,
  OnboardingConfigStatus,
  OnboardingRequirementKind,
  RegisterPasskeyRequirement,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import createOnboardingRequirementsMachine, {
  OnboardingRequirementsMachineArgs,
} from './machine';

const livenessRequirement: RegisterPasskeyRequirement = {
  kind: OnboardingRequirementKind.registerPasskey,
  isMet: false,
};

const idDocRequirement: IdDocRequirement = {
  kind: OnboardingRequirementKind.idDoc,
  isMet: false,
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  onlyUsSupported: false,
  supportedDocumentTypes: [],
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
    status: OnboardingConfigStatus.enabled,
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
    optionalData: [],
    isAppClipEnabled: false,
    isNoPhoneFlow: false,
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
          bootstrapData: {
            [IdDI.email]: 'piip@onefootprint.com',
          },
        }),
      );

      machine.start();
      let { state } = machine;
      expect(state.value).toBe('checkRequirements');
      const { requirements, startedDataCollection, onboardingContext } =
        state.context;
      expect(requirements).toEqual([]);
      expect(startedDataCollection).toBe(false);
      expect(onboardingContext).toEqual({
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        userFound: true,
        authToken: 'token',
        config: { ...TestOnboardingConfig },
        bootstrapData: {
          [IdDI.email]: 'piip@onefootprint.com',
        },
      });

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [],
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
        payload: [kycRequirement, livenessRequirement, authorizeRequirement],
      });

      expect(state.context.requirements).toEqual([
        kycRequirement,
        livenessRequirement,
        authorizeRequirement,
      ]);
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
      expect(state.value).toBe('checkRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [livenessRequirement, authorizeRequirement],
      });
      expect(state.context.requirements).toEqual([
        livenessRequirement,
        authorizeRequirement,
      ]);

      expect(state.value).toBe('transfer');

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
        payload: [kycRequirement, livenessRequirement, authorizeRequirement],
      });
      expect(state.context.requirements).toEqual([
        kycRequirement,
        livenessRequirement,
        authorizeRequirement,
      ]);

      expect(state.value).toBe('kycData');

      state = machine.send({
        type: 'requirementCompleted',
      });
      expect(state.value).toBe('checkRequirements');

      state = machine.send({
        type: 'onboardingRequirementsReceived',
        payload: [livenessRequirement, idDocRequirement, authorizeRequirement],
      });
      expect(state.context.requirements).toEqual([
        livenessRequirement,
        idDocRequirement,
        authorizeRequirement,
      ]);

      expect(state.value).toBe('transfer');

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
});
