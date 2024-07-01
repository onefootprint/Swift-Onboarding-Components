import type { PublicOnboardingConfig } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  IdDI,
  OnboardingConfigStatus,
  OnboardingRequirementKind,
  UsLegalStatus,
  VisaKind,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import type { KycData } from '../data-types';
import type { InitMachineArgs } from './machine';
import createCollectKycDataMachine from './machine';

describe('Collect KYC Data Machine Tests', () => {
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

  const createMachine = (missingAttributes: CollectedKycDataOption[], data: KycData = {}, deviceType?: string) => {
    const initialContext: InitMachineArgs = {
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
        osName: 'iOS',
        browser: 'Mobile Safari',
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
          CollectedKycDataOption.email,
          CollectedKycDataOption.name,
          CollectedKycDataOption.address,
          CollectedKycDataOption.usLegalStatus,
          CollectedKycDataOption.ssn9,
        ],
        { [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true } },
        'sandboxTest',
      );
      expect(machine.state.context.dataCollectionScreensToShow).toEqual([
        'basicInformation',
        'residentialAddress',
        'usLegalStatus',
        'ssn',
        'confirm',
      ]);
      machine.send({ type: 'initialized', payload: {} });
      let { state } = machine;
      let { context } = state;
      expect(context.data[IdDI.email]).toEqual({
        value: 'piip@onefootprint.com',
        bootstrap: true,
      });
      expect(state.value).toEqual('basicInformation');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'Otto' },
          [IdDI.middleName]: { value: 'M.' },
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
          [IdDI.addressLine1]: { value: 'Address line 1' },
          [IdDI.city]: { value: 'City' },
          [IdDI.state]: { value: 'CA' },
          [IdDI.country]: { value: 'US' },
          [IdDI.zip]: { value: '94107' },
        },
      });
      expect(state.value).toEqual('usLegalStatus');
      context = state.context;
      expect(context.data[IdDI.country]).toEqual({ value: 'US' });
      expect(context.data[IdDI.addressLine1]).toEqual({
        value: 'Address line 1',
      });
      expect(context.data[IdDI.city]).toEqual({ value: 'City' });
      expect(context.data[IdDI.state]).toEqual({ value: 'CA' });
      expect(context.data[IdDI.zip]).toEqual({ value: '94107' });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('residentialAddress');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.addressLine1]: { value: 'Address!' },
          [IdDI.city]: { value: 'Ankara' },
          [IdDI.country]: { value: 'US' },
          [IdDI.state]: { value: 'Eskisehir' },
          [IdDI.zip]: { value: '12345' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.country]).toEqual({ value: 'US' });
      expect(context.data[IdDI.addressLine1]).toEqual({
        value: 'Address!',
      });
      expect(context.data[IdDI.city]).toEqual({ value: 'Ankara' });
      expect(context.data[IdDI.state]).toEqual({ value: 'Eskisehir' });
      expect(context.data[IdDI.zip]).toEqual({ value: '12345' });
      expect(state.value).toEqual('usLegalStatus');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.usLegalStatus]: { value: UsLegalStatus.permanentResident },
          [IdDI.nationality]: { value: 'CA' },
          [IdDI.citizenships]: { value: ['HK'] },
        },
      });
      expect(state.value).toEqual('ssn');
      context = state.context;
      expect(context.data[IdDI.usLegalStatus]).toEqual({
        value: UsLegalStatus.permanentResident,
      });
      expect(context.data[IdDI.nationality]).toEqual({ value: 'CA' });
      expect(context.data[IdDI.citizenships]).toEqual({ value: ['HK'] });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('usLegalStatus');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.usLegalStatus]: { value: UsLegalStatus.citizen },
        },
      });
      context = state.context;
      expect(context.data[IdDI.usLegalStatus]).toEqual({
        value: UsLegalStatus.citizen,
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

    it('Skips states without missing attributes', () => {
      const machine = createMachine([CollectedKycDataOption.name, CollectedKycDataOption.ssn9]);
      expect(machine.state.context.dataCollectionScreensToShow).toEqual(['basicInformation', 'ssn', 'confirm']);
      machine.send({ type: 'initialized', payload: {} });

      let { state } = machine;
      let { context } = state;
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

    it('Skips SSN and US Legal Status pages if address is not in US', () => {
      const machine = createMachine(
        [
          CollectedKycDataOption.email,
          CollectedKycDataOption.name,
          CollectedKycDataOption.address,
          CollectedKycDataOption.usLegalStatus,
          CollectedKycDataOption.ssn9,
        ],
        { [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true } },
        'sandboxTest',
      );
      expect(machine.state.context.dataCollectionScreensToShow).toEqual([
        'basicInformation',
        'residentialAddress',
        'usLegalStatus',
        'ssn',
        'confirm',
      ]);

      let state = machine.send([
        { type: 'initialized', payload: {} },
        {
          type: 'dataSubmitted',
          payload: {
            [IdDI.firstName]: { value: 'Otto' },
            [IdDI.lastName]: { value: 'Footprint' },
          },
        },
        {
          type: 'dataSubmitted',
          payload: {
            [IdDI.addressLine1]: { value: 'Address line 1' },
            [IdDI.city]: { value: 'City' },
            [IdDI.state]: { value: 'CA' },
            [IdDI.country]: { value: 'MX' },
            [IdDI.zip]: { value: '94107' },
          },
        },
      ]);

      // Skip US legal status and SSN because MX address

      expect(state.value).toEqual('confirm');
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('residentialAddress');

      state = machine.send([
        {
          type: 'dataSubmitted',
          payload: {
            [IdDI.addressLine1]: { value: 'Address line 1' },
            [IdDI.city]: { value: 'City' },
            [IdDI.state]: { value: 'CA' },
            [IdDI.country]: { value: 'US' },
            [IdDI.zip]: { value: '94107' },
          },
        },
      ]);
      expect(state.value).toEqual('usLegalStatus');
    });

    it('Should go to ssn screen if user is missing ssn', () => {
      const machine = createMachine(
        [
          CollectedKycDataOption.email,
          CollectedKycDataOption.name,
          CollectedKycDataOption.address,
          CollectedKycDataOption.usLegalStatus,
          CollectedKycDataOption.ssn4,
        ],
        {
          [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true },
          [IdDI.firstName]: { value: 'Bob', bootstrap: true },
          [IdDI.lastName]: { value: 'Lee', bootstrap: true },
          [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
          [IdDI.city]: { value: 'San Francisco', bootstrap: true },
          [IdDI.state]: { value: 'CA', disabled: true },
          [IdDI.zip]: { value: '94105', disabled: true },
          [IdDI.country]: { value: 'US', disabled: true },
          [IdDI.usLegalStatus]: { value: UsLegalStatus.citizen },
        },
      );

      expect(machine.state.context.dataCollectionScreensToShow).toEqual(['ssn', 'confirm']);
    });
  });

  describe('When user is missing an email', () => {
    it('If missing at least one attribute from each page, takes user to all pages in order email', () => {
      const machine = createMachine([
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.address,
        CollectedKycDataOption.usLegalStatus,
        CollectedKycDataOption.ssn9,
      ]);
      expect(machine.state.context.dataCollectionScreensToShow).toEqual([
        'email',
        'basicInformation',
        'residentialAddress',
        'usLegalStatus',
        'ssn',
        'confirm',
      ]);
      machine.send({ type: 'initialized', payload: {} });
      let { state } = machine;
      let { context } = state;
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
      expect(state.value).toEqual('usLegalStatus');
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
          [IdDI.country]: { value: 'US' },
          [IdDI.zip]: { value: '12321' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.country]).toEqual({ value: 'US' });
      expect(context.data[IdDI.zip]).toEqual({ value: '12321' });
      expect(state.value).toEqual('usLegalStatus');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.usLegalStatus]: { value: UsLegalStatus.citizen },
        },
      });
      expect(state.value).toEqual('ssn');
      context = state.context;
      expect(context.data[IdDI.usLegalStatus]).toEqual({
        value: UsLegalStatus.citizen,
      });

      // Navigate to prev
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('usLegalStatus');
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.usLegalStatus]: { value: UsLegalStatus.visa },
          [IdDI.nationality]: { value: 'CA' },
          [IdDI.citizenships]: { value: ['HK'] },
          [IdDI.visaKind]: { value: VisaKind.h1b },
          [IdDI.visaExpirationDate]: { value: '01012054' },
        },
      });
      context = state.context;
      expect(context.data[IdDI.usLegalStatus]).toEqual({
        value: UsLegalStatus.visa,
      });
      expect(context.data[IdDI.nationality]).toEqual({ value: 'CA' });
      expect(context.data[IdDI.citizenships]).toEqual({ value: ['HK'] });
      expect(context.data[IdDI.visaKind]).toEqual({ value: VisaKind.h1b });
      expect(context.data[IdDI.visaExpirationDate]).toEqual({
        value: '01012054',
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

    it('Skips states without missing attributes', () => {
      const machine = createMachine([CollectedKycDataOption.email, CollectedKycDataOption.ssn9]);
      expect(machine.state.context.dataCollectionScreensToShow).toEqual(['email', 'ssn', 'confirm']);
      machine.send({ type: 'initialized', payload: {} });
      let { state } = machine;
      let { context } = state;
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
        [CollectedKycDataOption.ssn9, CollectedKycDataOption.email],
        { [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true } },
        'sandboxTest',
      );
      expect(machine.state.context.dataCollectionScreensToShow).toEqual(['ssn', 'confirm']);
      machine.send({ type: 'initialized', payload: {} });
      let { state } = machine;
      let { context } = state;
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
        [CollectedKycDataOption.email, CollectedKycDataOption.name, CollectedKycDataOption.address],
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
      expect(machine.state.context.dataCollectionScreensToShow).toEqual(['confirm']);
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
        [CollectedKycDataOption.email, CollectedKycDataOption.address, CollectedKycDataOption.dob],
        {
          [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true },
          [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
          [IdDI.city]: { value: 'San Francisco', bootstrap: true },
          [IdDI.state]: { value: 'CA', disabled: true },
          [IdDI.zip]: { value: '94105', disabled: true },
          [IdDI.country]: { value: 'US', disabled: true },
        },
      );
      expect(machine.state.context.dataCollectionScreensToShow).toEqual(['basicInformation', 'confirm']);
      machine.send({
        type: 'initialized',
        payload: {
          [IdDI.firstName]: { value: 'John', decrypted: true },
          [IdDI.lastName]: { value: 'Smith', decrypted: true },
          [IdDI.ssn9]: { value: '101010101', decrypted: true },
        },
      });
      let { state } = machine;

      // We're only missing the DOB on the basic information page, but we show the whole page
      expect(state.value).toEqual('basicInformation');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'John', decrypted: true },
          [IdDI.lastName]: { value: 'Smith', decrypted: true },
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
        CollectedKycDataOption.address,
        CollectedKycDataOption.usLegalStatus,
        CollectedKycDataOption.ssn9,
      ]);
      expect(machine.state.context.dataCollectionScreensToShow).toEqual([
        'email',
        'basicInformation',
        'residentialAddress',
        'usLegalStatus',
        'ssn',
        'confirm',
      ]);
      machine.send({ type: 'initialized', payload: {} });
      let { state } = machine;
      const { context } = state;
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
          [IdDI.usLegalStatus]: { value: UsLegalStatus.citizen },
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
        type: 'editUsLegalStatus',
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
          [IdDI.usLegalStatus]: { value: UsLegalStatus.permanentResident },
          [IdDI.nationality]: { value: 'BR' },
          [IdDI.citizenships]: { value: ['IT', 'VE'] },
        },
      });
      expect(state.context.data[IdDI.usLegalStatus]).toEqual({
        value: UsLegalStatus.permanentResident,
      });
      expect(state.context.data[IdDI.nationality]).toEqual({ value: 'BR' });
      expect(state.context.data[IdDI.citizenships]).toEqual({
        value: ['IT', 'VE'],
      });
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

  describe('When navigating backward then forward through the flow', () => {
    it('If there was at least one attribute missing from each page to begin with, takes user to all pages in order', () => {
      const machine = createMachine(
        [
          CollectedKycDataOption.email,
          CollectedKycDataOption.name,
          CollectedKycDataOption.address,
          CollectedKycDataOption.usLegalStatus,
          CollectedKycDataOption.ssn9,
        ],
        { [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true } },
        'sandboxTest',
      );
      expect(machine.state.context.dataCollectionScreensToShow).toEqual([
        'basicInformation',
        'residentialAddress',
        'usLegalStatus',
        'ssn',
        'confirm',
      ]);
      machine.send({ type: 'initialized', payload: {} });
      let { state } = machine;
      let { context } = state;
      expect(context.data[IdDI.email]).toEqual({
        value: 'piip@onefootprint.com',
        bootstrap: true,
      });
      expect(state.value).toEqual('basicInformation');

      // Forward linearly through the entire flow
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

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'US' },
          [IdDI.zip]: { value: '94107' },
        },
      });
      expect(state.value).toEqual('usLegalStatus');
      context = state.context;
      expect(context.data[IdDI.country]).toEqual({ value: 'US' });
      expect(context.data[IdDI.zip]).toEqual({ value: '94107' });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.usLegalStatus]: { value: UsLegalStatus.citizen },
        },
      });
      expect(state.value).toEqual('ssn');
      context = state.context;
      expect(context.data[IdDI.usLegalStatus]).toEqual({
        value: UsLegalStatus.citizen,
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

      // Backward linearly through the entire flow
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('ssn');

      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('usLegalStatus');

      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('residentialAddress');

      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('basicInformation');

      // Forward linearly again
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

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.country]: { value: 'US' },
          [IdDI.zip]: { value: '94107' },
        },
      });
      expect(state.value).toEqual('usLegalStatus');
      context = state.context;
      expect(context.data[IdDI.country]).toEqual({ value: 'US' });
      expect(context.data[IdDI.zip]).toEqual({ value: '94107' });

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.usLegalStatus]: { value: UsLegalStatus.citizen },
        },
      });
      expect(state.value).toEqual('ssn');
      context = state.context;
      expect(context.data[IdDI.usLegalStatus]).toEqual({
        value: UsLegalStatus.citizen,
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

      state = machine.send({
        type: 'confirmed',
      });
      context = state.context;
      expect(state.value).toEqual('completed');
    });

    it('Skips pages that were completed by decrypted/bootstrapped data', () => {
      const machine = createMachine(
        [CollectedKycDataOption.email, CollectedKycDataOption.dob, CollectedKycDataOption.address],
        {
          [IdDI.email]: { value: 'piip@onefootprint.com', bootstrap: true },
          [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
          [IdDI.city]: { value: 'San Francisco', bootstrap: true },
          [IdDI.state]: { value: 'CA', disabled: true },
          [IdDI.zip]: { value: '94105', disabled: true },
          [IdDI.country]: { value: 'US', disabled: true },
        },
      );
      expect(machine.state.context.dataCollectionScreensToShow).toEqual(['basicInformation', 'confirm']);
      machine.send({
        type: 'initialized',
        payload: {
          [IdDI.firstName]: { value: 'John', decrypted: true },
          [IdDI.lastName]: { value: 'Smith', decrypted: true },
          [IdDI.ssn9]: { value: '101010101', decrypted: true },
        },
      });
      let { state } = machine;

      // We're only missing the DOB on the basic information page, but we show the whole page
      expect(state.value).toEqual('basicInformation');

      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'John', decrypted: true },
          [IdDI.lastName]: { value: 'Smith', decrypted: true },
          [IdDI.dob]: { value: '01/04/1998', decrypted: true },
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

      // Navigating forward again skips ssn and address
      state = machine.send({
        type: 'dataSubmitted',
        payload: {
          [IdDI.firstName]: { value: 'John' },
          [IdDI.lastName]: { value: 'Smith' },
          [IdDI.dob]: { value: '01/04/1998' },
        },
      });
      expect(state.value).toEqual('confirm');
    });
  });
});
