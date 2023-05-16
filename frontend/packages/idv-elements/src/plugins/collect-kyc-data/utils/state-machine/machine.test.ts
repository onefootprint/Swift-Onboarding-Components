import {
  CollectedKycDataOption,
  IdDI,
  OnboardingConfig,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import { KycData } from '../data-types';
import createCollectKycDataMachine from './machine';
import { MachineContext } from './types';

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
    canAccessData: [CollectedKycDataOption.name],
  };

  const createMachine = (
    missingAttributes: CollectedKycDataOption[],
    data: KycData = {},
    sandboxSuffix?: string,
    deviceType?: string,
  ) => {
    const initialContext: MachineContext = {
      userFound: true,
      authToken: 'authToken',
      requirement: {
        kind: OnboardingRequirementKind.collectKycData,
        missingAttributes,
      },
      device: {
        type: deviceType ?? 'mobile',
        hasSupportForWebauthn: false,
      },
      config: { ...TestOnboardingConfig },
      data,
      initData: data,
      sandboxSuffix,
    };
    const machine = interpret(createCollectKycDataMachine(initialContext));
    machine.start();
    return machine;
  };

  describe('When user has missing fields', () => {
    it('If missing at least one attribute from each page, takes user to all pages in order', () => {
      const machine = createMachine(
        [
          CollectedKycDataOption.name,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
        ],
        { [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true } },
        'sandboxTest',
      );
      let { state } = machine;
      let { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.data[IdDI.email]).toEqual({
        value: 'piip@onefootprint.com',
        bootstrap: true,
      });
      expect(context.sandboxSuffix).toEqual('sandboxTest');
      expect(state.value).toEqual('basicInformation');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Otto' },
          [IdDI.lastName]: { value: 'Footprint' },
        },
      });
      expect(state.value).toEqual('residentialAddress');
      context = state.context;
      expect(context.data[IdDI.firstName]).toEqual({ value: 'Otto' });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('basicInformation');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Diffie' },
          [IdDI.lastName]: { value: 'Footprint' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.firstName]).toEqual({ value: 'Diffie' });
      expect(state.value).toEqual('residentialAddress');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'US' },
          [IdDI.zip]: { value: '94107' },
        },
      });
      expect(state.value).toEqual('ssn');
      context = state.context;
      expect(context.data[IdDI.country]).toEqual({ value: 'US' });
      expect(context.data[IdDI.zip]).toEqual({ value: '94107' });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('residentialAddress');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'TR' },
          [IdDI.zip]: { value: '94107' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.country]).toEqual({ value: 'TR' });
      expect(context.data[IdDI.zip]).toEqual({ value: '94107' });
      expect(state.value).toEqual('ssn');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '101010101' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.ssn9]).toEqual({ value: '101010101' });
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'confirmed',
      });
      context = state.context;
      expect(state.value).toEqual('completed');
    });

    it('Skips states without missing attributes', () => {
      const machine = createMachine([
        CollectedKycDataOption.name,
        CollectedKycDataOption.ssn9,
      ]);

      let { state } = machine;
      let { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.name,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.data[IdDI.email]).toBeUndefined();
      expect(state.value).toEqual('basicInformation');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Otto' },
          [IdDI.lastName]: { value: 'Footprint' },
        },
      });
      expect(state.value).toEqual('ssn');
      context = state.context;
      expect(context.data[IdDI.firstName]).toEqual({ value: 'Otto' });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('basicInformation');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Otto2' },
          [IdDI.lastName]: { value: 'Footprint' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.firstName]).toEqual({ value: 'Otto2' });
      expect(state.value).toEqual('ssn');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '101010101' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.ssn9]).toEqual({ value: '101010101' });
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'confirmed',
      });
      context = state.context;
      expect(state.value).toEqual('completed');
    });
  });

  describe('When user has onboarded to tenant with current configuration', () => {
    it('Onboarding ends', () => {
      const machine = createMachine([]);
      const { state } = machine;
      expect(state.value).toEqual('completed');
    });
  });

  describe('When user is missing an email', () => {
    it('If missing at least one attribute from each page, takes user to all pages in order', () => {
      const machine = createMachine([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      let { state } = machine;
      let { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.data[IdDI.email]).toBeUndefined();
      expect(state.value).toEqual('email');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.email]: { value: 'piip@onefootprint.com' },
        },
      });
      expect(state.value).toEqual('basicInformation');
      context = state.context;
      expect(context.data[IdDI.email]).toEqual({
        value: 'piip@onefootprint.com',
      });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('email');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.email]: { value: 'piip@onefootprint.com' },
        },
      });
      expect(state.value).toEqual('basicInformation');
      context = state.context;
      expect(context.data[IdDI.email]).toEqual({
        value: 'piip@onefootprint.com',
      });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Otto' },
          [IdDI.lastName]: { value: 'Footprint' },
        },
      });
      expect(state.value).toEqual('residentialAddress');
      context = state.context;
      expect(context.data[IdDI.firstName]).toEqual({ value: 'Otto' });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('basicInformation');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Diffie' },
          [IdDI.lastName]: { value: 'Footprint' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.firstName]).toEqual({ value: 'Diffie' });
      expect(state.value).toEqual('residentialAddress');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'US' },
          [IdDI.zip]: { value: '94107' },
        },
      });
      expect(state.value).toEqual('ssn');
      context = state.context;
      expect(context.data[IdDI.country]).toEqual({ value: 'US' });
      expect(context.data[IdDI.zip]).toEqual({ value: '94107' });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('residentialAddress');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'TR' },
          [IdDI.zip]: { value: '94107' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.country]).toEqual({ value: 'TR' });
      expect(context.data[IdDI.zip]).toEqual({ value: '94107' });
      expect(state.value).toEqual('ssn');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '101010101' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.ssn9]).toEqual({ value: '101010101' });
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'confirmed',
      });
      context = state.context;
      expect(state.value).toEqual('completed');
    });

    it('Skips states without missing attributes', () => {
      const machine = createMachine([
        CollectedKycDataOption.email,
        CollectedKycDataOption.ssn9,
      ]);
      let { state } = machine;
      let { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.data[IdDI.email]).toBeUndefined();
      expect(context.sandboxSuffix).toEqual(undefined);
      expect(state.value).toEqual('email');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.email]: { value: 'piip@onefootprint.com' },
        },
      });
      expect(state.value).toEqual('ssn');
      context = state.context;
      expect(context.data[IdDI.email]).toEqual({
        value: 'piip@onefootprint.com',
      });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('email');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.email]: { value: 'piip@onefootprint.com' },
        },
      });
      expect(state.value).toEqual('ssn');
      context = state.context;
      expect(context.data[IdDI.email]).toEqual({
        value: 'piip@onefootprint.com',
      });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '101010101' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.ssn9]).toEqual({ value: '101010101' });
      expect(state.value).toEqual('confirm');

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('ssn');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '101010101' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.ssn9]).toEqual({ value: '101010101' });
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'confirmed',
      });
      context = state.context;
      expect(state.value).toEqual('completed');
    });

    it('when email is received in the initial context', () => {
      const machine = createMachine(
        [CollectedKycDataOption.email, CollectedKycDataOption.ssn9],
        { [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true } },
        'sandboxTest',
      );
      let { state } = machine;
      let { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.data[IdDI.email]).toEqual({
        value: 'piip@onefootprint.com',
        bootstrap: true,
      });

      expect(state.value).toEqual('ssn');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '101010101' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.ssn9]).toEqual({ value: '101010101' });
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'confirmed',
      });
      context = state.context;
      expect(state.value).toEqual('completed');
    });
  });

  describe('When user has bootstrapped/decrypted/disabled data', () => {
    it('if no attributes are missing at the start', () => {
      const machine = createMachine(
        [
          CollectedKycDataOption.name,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
        ],
        {
          [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true },
          [IdDI.firstName]: { value: 'John', bootstrap: true },
          [IdDI.lastName]: { value: 'Doe', bootstrap: true },
          [IdDI.addressLine1]: { value: '123 Main St', decrypted: true },
          [IdDI.city]: { value: 'San Francisco', decrypted: true },
          [IdDI.state]: { value: 'CA', disabled: true },
          [IdDI.zip]: { value: '94105', disabled: true },
          [IdDI.country]: { value: 'US', disabled: true },
          [IdDI.ssn9]: { value: '101010101', decrypted: true },
        },
      );
      let { state } = machine;
      const { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);

      expect(state.value).toEqual('confirm');
      // Navigate to prev should be a no-op
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('confirm');
    });

    it('if some attributes are missing at the start', () => {
      const machine = createMachine(
        [
          CollectedKycDataOption.name,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
        ],
        {
          [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true },
          [IdDI.firstName]: { value: 'John', bootstrap: true },
          [IdDI.addressLine1]: { value: '123 Main St', decrypted: true },
          [IdDI.city]: { value: 'San Francisco', decrypted: true },
          [IdDI.state]: { value: 'CA', disabled: true },
          [IdDI.zip]: { value: '94105', disabled: true },
          [IdDI.country]: { value: 'US', disabled: true },
          [IdDI.ssn9]: { value: '101010101', decrypted: true },
        },
      );
      let { state } = machine;
      const { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);

      expect(state.value).toEqual('basicInformation');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Diffie' },
          [IdDI.lastName]: { value: 'Footprint' },
        },
      });
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('basicInformation');
    });
  });

  describe('Confirm flow', () => {
    it('when on mobile', () => {
      const machine = createMachine([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      let { state } = machine;
      const { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.data[IdDI.email]).toBeUndefined();

      // Collect all fields first
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.email]: { value: 'piip@onefootprint.com' },
        },
      });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Otto' },
          [IdDI.lastName]: { value: 'Footprint' },
        },
      });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'US' },
          [IdDI.zip]: { value: '94107' },
        },
      });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '101010101' },
        },
      });

      expect(state.value).toEqual('confirm');

      // On mobile, these events shouldn't trigger any state changes
      state = machine.send({
        type: 'editEmail',
      });
      expect(state.value).toEqual('confirm');
      state = machine.send({
        type: 'editBasicInfo',
      });
      expect(state.value).toEqual('confirm');
      state = machine.send({
        type: 'editAddress',
      });
      expect(state.value).toEqual('confirm');
      state = machine.send({
        type: 'editIdentity',
      });
      expect(state.value).toEqual('confirm');

      // On mobile, we should be able to edit the data from the confirm state
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.email]: { value: 'new-email' },
        },
      });
      expect(state.context.data[IdDI.email]).toEqual({ value: 'new-email' });
      expect(state.value).toBe('confirm');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Belce' },
          [IdDI.lastName]: { value: 'Dogru' },
        },
      });
      expect(state.context.data[IdDI.firstName]).toEqual({ value: 'Belce' });
      expect(state.context.data[IdDI.lastName]).toEqual({ value: 'Dogru' });
      expect(state.value).toBe('confirm');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'TR' },
          [IdDI.zip]: { value: '00000' },
        },
      });
      expect(state.context.data[IdDI.country]).toEqual({ value: 'TR' });
      expect(state.context.data[IdDI.zip]).toEqual({ value: '00000' });
      expect(state.value).toBe('confirm');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '99999999' },
        },
      });
      expect(state.context.data[IdDI.ssn9]).toEqual({ value: '99999999' });
      expect(state.value).toEqual('confirm');
    });

    it('when on desktop', () => {
      const machine = createMachine(
        [
          CollectedKycDataOption.email,
          CollectedKycDataOption.name,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
        ],
        undefined,
        undefined,
        'unknown',
      );
      let { state } = machine;
      const { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      expect(context.data[IdDI.email]).toBeUndefined();

      // Collect all fields first
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.email]: { value: 'piip@onefootprint.com' },
        },
      });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Otto' },
          [IdDI.lastName]: { value: 'Footprint' },
        },
      });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'US' },
          [IdDI.zip]: { value: '94107' },
        },
      });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '101010101' },
        },
      });

      expect(state.value).toEqual('confirm');

      // On desktop, these events shouldn't trigger any state changes
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.email]: { value: 'new-email' },
        },
      });
      expect(state.value).toEqual('confirm');
      expect(state.context.data[IdDI.email]).toEqual({
        value: 'piip@onefootprint.com',
      });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'NEW' },
          [IdDI.lastName]: { value: 'NAME' },
        },
      });
      expect(state.value).toEqual('confirm');
      expect(state.context.data[IdDI.firstName]).toEqual({ value: 'Otto' });
      expect(state.context.data[IdDI.lastName]).toEqual({ value: 'Footprint' });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'TR' },
          [IdDI.zip]: { value: '02118' },
        },
      });
      expect(state.value).toEqual('confirm');
      expect(state.context.data[IdDI.country]).toEqual({ value: 'US' });
      expect(state.context.data[IdDI.zip]).toEqual({ value: '94107' });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn4]: { value: '9999' },
        },
      });
      expect(state.value).toEqual('confirm');
      expect(state.context.data[IdDI.ssn9]).toEqual({ value: '101010101' });
      expect(state.context.data[IdDI.ssn4]).toBeUndefined();

      // The following actions on desktop should take the user to edit states
      state = machine.send({
        type: 'editEmail',
      });
      expect(state.value).toEqual('emailEditDesktop');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.email]: { value: 'new-email' },
        },
      });
      expect(state.context.data[IdDI.email]).toEqual({ value: 'new-email' });
      expect(state.value).toBe('confirm');

      state = machine.send({
        type: 'editEmail',
      });
      expect(state.value).toEqual('emailEditDesktop');
      state = machine.send({
        type: 'returnToSummary',
      });
      expect(state.value).toBe('confirm');

      state = machine.send({
        type: 'editBasicInfo',
      });
      expect(state.value).toEqual('basicInfoEditDesktop');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Belce' },
          [IdDI.lastName]: { value: 'Dogru' },
        },
      });
      expect(state.context.data[IdDI.firstName]).toEqual({ value: 'Belce' });
      expect(state.context.data[IdDI.lastName]).toEqual({ value: 'Dogru' });
      expect(state.value).toBe('confirm');

      state = machine.send({
        type: 'editBasicInfo',
      });
      expect(state.value).toEqual('basicInfoEditDesktop');
      state = machine.send({
        type: 'returnToSummary',
      });
      expect(state.value).toBe('confirm');

      state = machine.send({
        type: 'editAddress',
      });
      expect(state.value).toEqual('addressEditDesktop');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'TR' },
          [IdDI.zip]: { value: '00000' },
        },
      });
      expect(state.context.data[IdDI.country]).toEqual({ value: 'TR' });
      expect(state.context.data[IdDI.zip]).toEqual({ value: '00000' });
      expect(state.value).toBe('confirm');

      state = machine.send({
        type: 'editAddress',
      });
      expect(state.value).toEqual('addressEditDesktop');
      state = machine.send({
        type: 'returnToSummary',
      });
      expect(state.value).toBe('confirm');

      state = machine.send({
        type: 'editIdentity',
      });
      expect(state.value).toEqual('identityEditDesktop');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.ssn9]: { value: '99999999' },
        },
      });
      expect(state.context.data[IdDI.ssn9]).toEqual({ value: '99999999' });
      expect(state.value).toEqual('confirm');

      state = machine.send({
        type: 'editIdentity',
      });
      expect(state.value).toEqual('identityEditDesktop');
      state = machine.send({
        type: 'returnToSummary',
      });
      expect(state.value).toBe('confirm');
    });
  });
});
