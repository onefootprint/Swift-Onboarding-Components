import { DeviceInfo } from 'hooks';
import { interpret } from 'xstate';

import { TenantInfo, UserDataAttribute } from '../types';
import createOnboardingMachine from './machine';
import { Events, States } from './types';

describe('Onboarding Machine Tests', () => {
  const tenant: TenantInfo = {
    pk: 'pk',
    name: 'tenant',
    mustCollectDataKinds: [
      UserDataAttribute.firstName,
      UserDataAttribute.lastName,
      UserDataAttribute.email,
      UserDataAttribute.city,
      UserDataAttribute.ssn,
    ],
    canAccessDataKinds: [
      UserDataAttribute.firstName,
      UserDataAttribute.lastName,
      UserDataAttribute.email,
      UserDataAttribute.city,
      UserDataAttribute.ssn,
    ],
    orgName: 'tenantOrg',
  };

  const createMachine = (userFound: boolean, device: DeviceInfo) =>
    interpret(
      createOnboardingMachine({
        userFound,
        device,
        authToken: 'authToken',
        tenant,
      }),
    );

  describe('Correctly initializes', () => {
    it('User not found and missing attributes are set correctly in context', () => {
      const device = {
        hasSupportForWebauthn: false,
        type: 'mobile',
      };
      const machine = createMachine(true, device);
      machine.start();

      // Check that the initial context was set correctly from the args
      const { state } = machine;
      const { context } = state;
      expect(context.authToken).toEqual('authToken');
      expect(context.userFound).toEqual(true);
      expect(context.tenant).toEqual(tenant);
      expect(context.data).toEqual({});
      expect(context.missingWebauthnCredentials).toEqual(false);
      expect(context.missingAttributes).toEqual([]);
      expect(context.validationToken).toEqual(undefined);
      expect(context.device).toEqual(device);
      expect(state.value).toEqual(States.onboardingVerification);
    });
  });

  describe('When user has missing fields', () => {
    it('If missing biometric credentials, starts liveness register', () => {
      const machine = createMachine(true, {
        type: 'mobile',
        hasSupportForWebauthn: true,
      });
      machine.start();
      let state = machine.send({
        type: Events.onboardingVerificationCompleted,
        payload: {
          missingAttributes: [UserDataAttribute.firstName],
          missingWebauthnCredentials: true,
        },
      });
      expect(state.value).toEqual(States.additionalDataRequired);
      const { context } = state;
      expect(context.missingAttributes).toEqual([UserDataAttribute.firstName]);
      expect(context.missingWebauthnCredentials).toEqual(true);

      state = machine.send({
        type: Events.additionalInfoRequired,
      });
      expect(state.value).toEqual(States.livenessRegister);
    });

    it('If missing at least one attribute from each page, takes user to all pages in order', () => {
      const machine = createMachine(true, {
        type: 'mobile',
        hasSupportForWebauthn: true,
      });
      machine.start();
      let state = machine.send({
        type: Events.onboardingVerificationCompleted,
        payload: {
          missingAttributes: [
            UserDataAttribute.firstName,
            UserDataAttribute.country,
            UserDataAttribute.ssn,
          ],
          missingWebauthnCredentials: false,
        },
      });
      expect(state.value).toEqual(States.additionalDataRequired);
      let { context } = state;
      expect(context.missingAttributes).toEqual([
        UserDataAttribute.firstName,
        UserDataAttribute.country,
        UserDataAttribute.ssn,
      ]);
      expect(context.missingWebauthnCredentials).toEqual(false);

      state = machine.send({
        type: Events.additionalInfoRequired,
      });
      expect(state.value).toEqual(States.basicInformation);

      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: { firstName: 'Otto', lastName: 'Footprint' },
        },
      });
      expect(state.value).toEqual(States.residentialAddress);
      context = state.context;
      expect(context.data.firstName).toEqual('Otto');

      // Navigate to prev
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.basicInformation);
      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: { firstName: 'Diffie', lastName: 'Footprint' },
        },
      });
      context = state.context;
      expect(context.data.firstName).toEqual('Diffie');
      expect(state.value).toEqual(States.residentialAddress);

      state = machine.send({
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress: { country: 'US', zip: '94107' },
        },
      });
      expect(state.value).toEqual(States.ssn);
      context = state.context;
      expect(context.data.country).toEqual('US');

      // Navigate to prev
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.residentialAddress);
      state = machine.send({
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress: { country: 'TR', zip: '94107' },
        },
      });
      context = state.context;
      expect(context.data.country).toEqual('TR');
      expect(state.value).toEqual(States.ssn);

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn: '101010101',
        },
      });
      expect(state.value).toEqual(States.onboardingComplete);
      context = state.context;
      expect(context.data.ssn).toEqual('101010101');
    });

    it('Skips states without missing attributes', () => {
      const machine = createMachine(true, {
        type: 'mobile',
        hasSupportForWebauthn: true,
      });
      machine.start();
      let state = machine.send({
        type: Events.onboardingVerificationCompleted,
        payload: {
          missingAttributes: [
            UserDataAttribute.firstName,
            UserDataAttribute.ssn,
          ],
          missingWebauthnCredentials: false,
        },
      });
      expect(state.value).toEqual(States.additionalDataRequired);
      let { context } = state;
      expect(context.missingAttributes).toEqual([
        UserDataAttribute.firstName,
        UserDataAttribute.ssn,
      ]);
      expect(context.missingWebauthnCredentials).toEqual(false);

      state = machine.send({
        type: Events.additionalInfoRequired,
      });
      expect(state.value).toEqual(States.basicInformation);

      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: { firstName: 'Otto', lastName: 'Footprint' },
        },
      });
      expect(state.value).toEqual(States.ssn);
      context = state.context;
      expect(context.data.firstName).toEqual('Otto');

      // Navigate to prev
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.basicInformation);
      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: { firstName: 'Otto2', lastName: 'Footprint' },
        },
      });
      context = state.context;
      expect(context.data.firstName).toEqual('Otto2');
      expect(state.value).toEqual(States.ssn);

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn: '101010101',
        },
      });
      expect(state.value).toEqual(States.onboardingComplete);
      context = state.context;
      expect(context.data.ssn).toEqual('101010101');
    });
  });

  describe('When user has onboarded to tenant with current configuration', () => {
    it('Onboarding ends', () => {
      const machine = createMachine(true, {
        type: 'mobile',
        hasSupportForWebauthn: true,
      });
      machine.start();
      const state = machine.send({
        type: Events.onboardingVerificationCompleted,
        payload: {
          missingAttributes: [],
          missingWebauthnCredentials: false,
          validationToken: 'token',
        },
      });
      expect(state.value).toEqual(States.onboardingComplete);
    });
  });
});
