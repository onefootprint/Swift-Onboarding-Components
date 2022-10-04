import {
  CollectedDataOption,
  TenantInfo,
  UserDataAttribute,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import createCollectKycDataMachine from './machine';
import { Events, States } from './types';

describe('Onboarding Machine Tests', () => {
  const tenant: TenantInfo = {
    isLive: true,
    pk: 'pk',
    name: 'tenant',
    mustCollectData: [
      CollectedDataOption.name,
      CollectedDataOption.email,
      CollectedDataOption.fullAddress,
      CollectedDataOption.ssn9,
    ],
    canAccessData: [
      CollectedDataOption.name,
      CollectedDataOption.email,
      CollectedDataOption.fullAddress,
      CollectedDataOption.ssn9,
    ],
    orgName: 'tenantOrg',
  };

  const createMachine = (
    userFound: boolean,
    missingAttributes: CollectedDataOption[],
  ) => {
    const machine = interpret(createCollectKycDataMachine());
    machine.start();
    machine.send({
      type: Events.receivedContext,
      payload: {
        userFound,
        authToken: 'authToken',
        tenant,
        missingAttributes,
      },
    });
    return machine;
  };

  describe('When user has missing fields', () => {
    it('If missing at least one attribute from each page, takes user to all pages in order', () => {
      const machine = createMachine(true, [
        CollectedDataOption.name,
        CollectedDataOption.fullAddress,
        CollectedDataOption.ssn9,
      ]);
      let { state } = machine;
      let { context } = state;
      expect(context.missingAttributes).toEqual([
        CollectedDataOption.name,
        CollectedDataOption.fullAddress,
        CollectedDataOption.ssn9,
      ]);
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
        CollectedDataOption.name,
        CollectedDataOption.ssn9,
      ]);

      let { state } = machine;
      let { context } = state;
      expect(context.missingAttributes).toEqual([
        CollectedDataOption.name,
        CollectedDataOption.ssn9,
      ]);
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
});
