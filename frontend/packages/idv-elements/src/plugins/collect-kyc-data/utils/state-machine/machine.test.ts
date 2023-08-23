import {
  CollectedKycDataOption,
  IdDI,
  OnboardingConfig,
  OnboardingConfigStatus,
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
    status: OnboardingConfigStatus.enabled,
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
    optionalData: [],
    isAppClipEnabled: false,
    isNoPhoneFlow: false,
  };

  const createMachine = (
    missingAttributes: CollectedKycDataOption[],
    data: KycData = {},
    deviceType?: string,
  ) => {
    const initialContext: MachineContext = {
      userFound: true,
      authToken: 'authToken',
      requirement: {
        kind: OnboardingRequirementKind.collectKycData,
        isMet: false,
        missingAttributes,
        populatedAttributes: [],
        optionalAttributes: [],
      },
      device: {
        type: deviceType ?? 'desktop',
        hasSupportForWebauthn: false,
      },
      config: { ...TestOnboardingConfig },
      data,
      initialData: {},
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
      machine.send({ type: 'initialized', payload: {} });
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
      machine.send({ type: 'initialized', payload: {} });

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
      machine.send({ type: 'initialized', payload: {} });
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
      machine.send({ type: 'initialized', payload: {} });
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
      machine.send({ type: 'initialized', payload: {} });
      let { state } = machine;
      let { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.email,
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
      machine.send({ type: 'initialized', payload: {} });
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
          CollectedKycDataOption.dob,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
        ],
        {
          [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true },
          [IdDI.firstName]: { value: 'John', bootstrap: true },
          [IdDI.lastName]: { value: 'Doe', bootstrap: true },
          [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
          [IdDI.city]: { value: 'San Francisco', bootstrap: true },
          [IdDI.state]: { value: 'CA', disabled: true },
          [IdDI.zip]: { value: '94105', disabled: true },
          [IdDI.country]: { value: 'US', disabled: true },
        },
      );
      machine.send({
        type: 'initialized',
        payload: {
          [IdDI.dob]: { value: '', scrubbed: true },
          [IdDI.ssn9]: { value: '101010101', decrypted: true },
        },
      });
      let { state } = machine;
      const { context } = state;

      // Check decrypted data was applied
      expect(context.data[IdDI.ssn9]?.decrypted).toEqual(true);
      expect(context.data[IdDI.dob]?.scrubbed).toEqual(true);

      // Check initial data, which controls the back button
      expect(context.initialData[IdDI.email]?.bootstrap).toEqual(true);
      expect(context.initialData[IdDI.firstName]?.bootstrap).toEqual(true);
      expect(context.initialData[IdDI.lastName]?.bootstrap).toEqual(true);
      expect(context.initialData[IdDI.addressLine1]?.bootstrap).toEqual(true);
      expect(context.initialData[IdDI.city]?.bootstrap).toEqual(true);
      expect(context.initialData[IdDI.state]?.disabled).toEqual(true);
      expect(context.initialData[IdDI.zip]?.disabled).toBe(true);
      expect(context.initialData[IdDI.country]?.disabled).toBe(true);
      expect(context.initialData[IdDI.ssn9]?.decrypted).toEqual(true);
      expect(context.initialData[IdDI.dob]?.scrubbed).toEqual(true);

      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.name,
        CollectedKycDataOption.dob,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);

      // Bootstrap data and existing data together should overwrite
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
          CollectedKycDataOption.dob,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
        ],
        {
          [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true },
          [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
          [IdDI.city]: { value: 'San Francisco', bootstrap: true },
          [IdDI.state]: { value: 'CA', disabled: true },
          [IdDI.zip]: { value: '94105', disabled: true },
          [IdDI.country]: { value: 'US', disabled: true },
        },
      );
      machine.send({
        type: 'initialized',
        payload: {
          [IdDI.firstName]: { value: 'John', decrypted: true },
          [IdDI.lastName]: { value: 'Smith', decrypted: true },
          [IdDI.ssn9]: { value: '101010101', decrypted: true },
        },
      });
      let { state } = machine;
      const { context } = state;
      expect(context.requirement.missingAttributes).toEqual([
        CollectedKycDataOption.name,
        CollectedKycDataOption.dob,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);

      // We're only missing the DOB on the basic information page, but we show the whole page
      expect(state.value).toEqual('basicInformation');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'John' },
          [IdDI.lastName]: { value: 'Smith' },
          [IdDI.dob]: { value: '01/04/1998' },
        },
      });
      // Since we didn't change the name, we shouldn't overwrite the data decrypted from the vault.
      // This prevents us from unnecessarily posting it to the backend
      expect(state.context.data[IdDI.firstName]?.decrypted).toEqual(true);
      expect(state.context.data[IdDI.lastName]?.decrypted).toEqual(true);
      expect(state.context.data[IdDI.dob]?.value).toEqual('01/04/1998');
      expect(state.value).toEqual('confirm');

      // We should navigate straight back to basicInformation, skipping ssn and address which were
      // provided in the initial data
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('basicInformation');
    });
  });

  describe('Confirm flow', () => {
    it('completes flow correctly', () => {
      const machine = createMachine([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
      ]);
      machine.send({ type: 'initialized', payload: {} });
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

      // These events shouldn't trigger any state changes
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

      // We should be able to edit the data from the confirm state
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
  });
});
