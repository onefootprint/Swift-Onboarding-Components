import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedKycDataOption,
  OnboardingConfig,
  UserDataAttribute,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import createCollectKycDataMachine from './machine';
import { Events, States } from './types';

describe('Collect KYC Data Machine Tests', () => {
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
    mustCollectIdentityDocument: false,
    mustCollectSelfie: false,
    canAccessData: [CollectedKycDataOption.name],
    canAccessIdentityDocumentImages: false,
    canAccessSelfieImage: false,
  };

  const createMachine = (
    userFound: boolean,
    missingAttributes: CollectedKycDataOption[],
    device: DeviceInfo = {
      type: 'mobile',
      hasSupportForWebauthn: false,
    },
    email?: string,
  ) => {
    const machine = interpret(createCollectKycDataMachine());
    machine.start();
    machine.send({
      type: Events.receivedContext,
      payload: {
        userFound,
        authToken: 'authToken',
        missingAttributes,
        device,
        config: { ...TestOnboardingConfig },
        email,
      },
    });
    return machine;
  };

  describe('When user has missing fields', () => {
    it('If missing at least one attribute from each page, takes user to all pages in order', () => {
      const machine = createMachine(
        true,
        [
          CollectedKycDataOption.name,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
        ],
        {
          type: 'mobile',
          hasSupportForWebauthn: false,
        },
        'piip@onefootprint.com',
      );
      let { state } = machine;
      let { context } = state;
      expect(context.missingAttributes).toEqual([
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.data[UserDataAttribute.email]).toEqual(
        'piip@onefootprint.com',
      );
      expect(context.receivedEmail).toEqual(true);
      expect(state.value).toEqual(States.basicInformation);

      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Otto',
            [UserDataAttribute.lastName]: 'Footprint',
          },
        },
      });
      expect(state.value).toEqual(States.residentialAddress);
      context = state.context;
      expect(context.data[UserDataAttribute.firstName]).toEqual('Otto');

      // Navigate to prev
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.basicInformation);
      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Diffie',
            [UserDataAttribute.lastName]: 'Footprint',
          },
        },
      });
      context = state.context;
      expect(context.data[UserDataAttribute.firstName]).toEqual('Diffie');
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
      expect(context.data.zip).toEqual('94107');

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
      expect(context.data.zip).toEqual('94107');
      expect(state.value).toEqual(States.ssn);

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '101010101',
        },
      });
      context = state.context;
      expect(context.data.ssn9).toEqual('101010101');
      expect(state.value).toEqual(States.confirm);

      state = machine.send({
        type: Events.confirmed,
      });
      context = state.context;
      expect(state.value).toEqual(States.completed);
    });

    it('Skips states without missing attributes', () => {
      const machine = createMachine(true, [
        CollectedKycDataOption.name,
        CollectedKycDataOption.ssn9,
      ]);

      let { state } = machine;
      let { context } = state;
      expect(context.missingAttributes).toEqual([
        CollectedKycDataOption.name,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.receivedEmail).toEqual(false);
      expect(state.value).toEqual(States.basicInformation);

      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Otto',
            [UserDataAttribute.lastName]: 'Footprint',
          },
        },
      });
      expect(state.value).toEqual(States.ssn);
      context = state.context;
      expect(context.data[UserDataAttribute.firstName]).toEqual('Otto');

      // Navigate to prev
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.basicInformation);
      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Otto2',
            [UserDataAttribute.lastName]: 'Footprint',
          },
        },
      });
      context = state.context;
      expect(context.data[UserDataAttribute.firstName]).toEqual('Otto2');
      expect(state.value).toEqual(States.ssn);

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '101010101',
        },
      });
      context = state.context;
      expect(context.data.ssn9).toEqual('101010101');
      expect(state.value).toEqual(States.confirm);

      state = machine.send({
        type: Events.confirmed,
      });
      context = state.context;
      expect(state.value).toEqual(States.completed);
    });
  });

  describe('When user has onboarded to tenant with current configuration', () => {
    it('Onboarding ends', () => {
      const machine = createMachine(true, []);
      const { state } = machine;
      expect(state.value).toEqual(States.completed);
    });
  });

  describe('When user is missing an email', () => {
    it('If missing at least one attribute from each page, takes user to all pages in order', () => {
      const machine = createMachine(true, [
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      let { state } = machine;
      let { context } = state;
      expect(context.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.receivedEmail).toEqual(false);
      expect(state.value).toEqual(States.email);

      state = machine.send({
        type: Events.emailSubmitted,
        payload: {
          email: 'piip@onefootprint.com',
        },
      });
      expect(state.value).toEqual(States.basicInformation);
      context = state.context;
      expect(context.data[UserDataAttribute.email]).toEqual(
        'piip@onefootprint.com',
      );

      // Navigate to prev
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.email);
      state = machine.send({
        type: Events.emailSubmitted,
        payload: {
          email: 'piip@onefootprint.com',
        },
      });
      expect(state.value).toEqual(States.basicInformation);
      context = state.context;
      expect(context.data[UserDataAttribute.email]).toEqual(
        'piip@onefootprint.com',
      );

      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Otto',
            [UserDataAttribute.lastName]: 'Footprint',
          },
        },
      });
      expect(state.value).toEqual(States.residentialAddress);
      context = state.context;
      expect(context.data[UserDataAttribute.firstName]).toEqual('Otto');

      // Navigate to prev
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.basicInformation);
      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Diffie',
            [UserDataAttribute.lastName]: 'Footprint',
          },
        },
      });
      context = state.context;
      expect(context.data[UserDataAttribute.firstName]).toEqual('Diffie');
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
      expect(context.data.zip).toEqual('94107');

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
      expect(context.data.zip).toEqual('94107');
      expect(state.value).toEqual(States.ssn);

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '101010101',
        },
      });
      context = state.context;
      expect(context.data.ssn9).toEqual('101010101');
      expect(state.value).toEqual(States.confirm);

      state = machine.send({
        type: Events.confirmed,
      });
      context = state.context;
      expect(state.value).toEqual(States.completed);
    });

    it('Skips states without missing attributes', () => {
      const machine = createMachine(true, [
        CollectedKycDataOption.email,
        CollectedKycDataOption.ssn9,
      ]);
      let { state } = machine;
      let { context } = state;
      expect(context.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.receivedEmail).toEqual(false);
      expect(state.value).toEqual(States.email);

      state = machine.send({
        type: Events.emailSubmitted,
        payload: {
          email: 'piip@onefootprint.com',
        },
      });
      expect(state.value).toEqual(States.ssn);
      context = state.context;
      expect(context.data[UserDataAttribute.email]).toEqual(
        'piip@onefootprint.com',
      );

      // Navigate to prev
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.email);
      state = machine.send({
        type: Events.emailSubmitted,
        payload: {
          email: 'piip@onefootprint.com',
        },
      });
      expect(state.value).toEqual(States.ssn);
      context = state.context;
      expect(context.data[UserDataAttribute.email]).toEqual(
        'piip@onefootprint.com',
      );

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '101010101',
        },
      });
      context = state.context;
      expect(context.data.ssn9).toEqual('101010101');
      expect(state.value).toEqual(States.confirm);

      // Navigate to prev
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.ssn);
      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '101010101',
        },
      });
      context = state.context;
      expect(context.data.ssn9).toEqual('101010101');
      expect(state.value).toEqual(States.confirm);

      state = machine.send({
        type: Events.confirmed,
      });
      context = state.context;
      expect(state.value).toEqual(States.completed);
    });

    it('when email is received in the initial context', () => {
      const machine = createMachine(
        true,
        [CollectedKycDataOption.email, CollectedKycDataOption.ssn9],
        {
          type: 'mobile',
          hasSupportForWebauthn: false,
        },
        'piip@onefootprint.com',
      );
      let { state } = machine;
      let { context } = state;
      expect(context.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.data[UserDataAttribute.email]).toEqual(
        'piip@onefootprint.com',
      );
      expect(state.value).toEqual(States.ssn);

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '101010101',
        },
      });
      context = state.context;
      expect(context.data.ssn9).toEqual('101010101');
      expect(state.value).toEqual(States.confirm);

      state = machine.send({
        type: Events.confirmed,
      });
      context = state.context;
      expect(state.value).toEqual(States.completed);
    });
  });

  describe('Confirm flow', () => {
    it('when on mobile', () => {
      const machine = createMachine(
        true,
        [
          CollectedKycDataOption.email,
          CollectedKycDataOption.name,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
        ],
        {
          type: 'mobile',
          hasSupportForWebauthn: false,
        },
      );
      let { state } = machine;
      const { context } = state;
      expect(context.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.receivedEmail).toEqual(false);

      // Collect all fields first
      state = machine.send({
        type: Events.emailSubmitted,
        payload: {
          email: 'piip@onefootprint.com',
        },
      });

      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Otto',
            [UserDataAttribute.lastName]: 'Footprint',
          },
        },
      });

      state = machine.send({
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress: { country: 'US', zip: '94107' },
        },
      });

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '101010101',
        },
      });

      expect(state.value).toEqual(States.confirm);

      // On mobile, these events shouldn't trigger any state changes
      state = machine.send({
        type: Events.editEmail,
      });
      expect(state.value).toEqual(States.confirm);
      state = machine.send({
        type: Events.editBasicInfo,
      });
      expect(state.value).toEqual(States.confirm);
      state = machine.send({
        type: Events.editAddress,
      });
      expect(state.value).toEqual(States.confirm);
      state = machine.send({
        type: Events.editIdentity,
      });
      expect(state.value).toEqual(States.confirm);

      // On mobile, we should be able to edit the data from the confirm state
      state = machine.send({
        type: Events.emailSubmitted,
        payload: {
          email: 'new-email',
        },
      });
      expect(state.context.data[UserDataAttribute.email]).toEqual('new-email');
      expect(state.value).toBe(States.confirm);

      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Belce',
            [UserDataAttribute.lastName]: 'Dogru',
          },
        },
      });
      expect(state.context.data[UserDataAttribute.firstName]).toEqual('Belce');
      expect(state.context.data[UserDataAttribute.lastName]).toEqual('Dogru');
      expect(state.value).toBe(States.confirm);

      state = machine.send({
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress: { country: 'TR', zip: '00000' },
        },
      });
      expect(state.context.data.country).toEqual('TR');
      expect(state.context.data.zip).toEqual('00000');
      expect(state.value).toBe(States.confirm);

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '99999999',
        },
      });
      expect(state.context.data[UserDataAttribute.ssn9]).toEqual('99999999');
      expect(state.value).toEqual(States.confirm);
    });

    it('when on desktop', () => {
      const machine = createMachine(
        true,
        [
          CollectedKycDataOption.email,
          CollectedKycDataOption.name,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
        ],
        {
          type: 'unknown',
          hasSupportForWebauthn: false,
        },
      );
      let { state } = machine;
      const { context } = state;
      expect(context.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.receivedEmail).toEqual(false);

      // Collect all fields first
      state = machine.send({
        type: Events.emailSubmitted,
        payload: {
          email: 'piip@onefootprint.com',
        },
      });

      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Otto',
            [UserDataAttribute.lastName]: 'Footprint',
          },
        },
      });

      state = machine.send({
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress: { country: 'US', zip: '94107' },
        },
      });

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '101010101',
        },
      });

      expect(state.value).toEqual(States.confirm);

      // On desktop, these events shouldn't trigger any state changes
      state = machine.send({
        type: Events.emailSubmitted,
        payload: {
          email: 'new-email',
        },
      });
      expect(state.value).toEqual(States.confirm);
      expect(state.context.data[UserDataAttribute.email]).toEqual(
        'piip@onefootprint.com',
      );

      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'NEW',
            [UserDataAttribute.lastName]: 'NAME',
          },
        },
      });
      expect(state.value).toEqual(States.confirm);
      expect(state.context.data[UserDataAttribute.firstName]).toEqual('Otto');
      expect(state.context.data[UserDataAttribute.lastName]).toEqual(
        'Footprint',
      );

      state = machine.send({
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress: { country: 'TR', zip: '02118' },
        },
      });
      expect(state.value).toEqual(States.confirm);
      expect(state.context.data.country).toEqual('US');
      expect(state.context.data.zip).toEqual('94107');

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn4: '9999',
        },
      });
      expect(state.value).toEqual(States.confirm);
      expect(state.context.data[UserDataAttribute.ssn9]).toEqual('101010101');
      expect(state.context.data[UserDataAttribute.ssn4]).toBeUndefined();

      // The following actions on desktop should take the user to edit states
      state = machine.send({
        type: Events.editEmail,
      });
      expect(state.value).toEqual(States.emailEditDesktop);
      state = machine.send({
        type: Events.emailSubmitted,
        payload: {
          email: 'new-email',
        },
      });
      expect(state.context.data[UserDataAttribute.email]).toEqual('new-email');
      expect(state.value).toBe(States.confirm);

      state = machine.send({
        type: Events.editEmail,
      });
      expect(state.value).toEqual(States.emailEditDesktop);
      state = machine.send({
        type: Events.returnToSummary,
      });
      expect(state.value).toBe(States.confirm);

      state = machine.send({
        type: Events.editBasicInfo,
      });
      expect(state.value).toEqual(States.basicInfoEditDesktop);
      state = machine.send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation: {
            [UserDataAttribute.firstName]: 'Belce',
            [UserDataAttribute.lastName]: 'Dogru',
          },
        },
      });
      expect(state.context.data[UserDataAttribute.firstName]).toEqual('Belce');
      expect(state.context.data[UserDataAttribute.lastName]).toEqual('Dogru');
      expect(state.value).toBe(States.confirm);

      state = machine.send({
        type: Events.editBasicInfo,
      });
      expect(state.value).toEqual(States.basicInfoEditDesktop);
      state = machine.send({
        type: Events.returnToSummary,
      });
      expect(state.value).toBe(States.confirm);

      state = machine.send({
        type: Events.editAddress,
      });
      expect(state.value).toEqual(States.addressEditDesktop);
      state = machine.send({
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress: { country: 'TR', zip: '00000' },
        },
      });
      expect(state.context.data.country).toEqual('TR');
      expect(state.context.data.zip).toEqual('00000');
      expect(state.value).toBe(States.confirm);

      state = machine.send({
        type: Events.editAddress,
      });
      expect(state.value).toEqual(States.addressEditDesktop);
      state = machine.send({
        type: Events.returnToSummary,
      });
      expect(state.value).toBe(States.confirm);

      state = machine.send({
        type: Events.editIdentity,
      });
      expect(state.value).toEqual(States.identityEditDesktop);

      state = machine.send({
        type: Events.ssnSubmitted,
        payload: {
          ssn9: '99999999',
        },
      });
      expect(state.context.data[UserDataAttribute.ssn9]).toEqual('99999999');
      expect(state.value).toEqual(States.confirm);

      state = machine.send({
        type: Events.editIdentity,
      });
      expect(state.value).toEqual(States.identityEditDesktop);
      state = machine.send({
        type: Events.returnToSummary,
      });
      expect(state.value).toBe(States.confirm);
    });
  });
});
