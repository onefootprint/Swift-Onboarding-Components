import themes from '@onefootprint/design-tokens';
import { mockRouter, render, screen, userEvent, waitFor, within } from '@onefootprint/test-utils';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI, OnboardingConfigStatus, OnboardingRequirementKind } from '@onefootprint/types';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Layout } from 'src/components/layout';

import CollectKycData from './index';
import { withIdentify, withOnboardingConfig, withUserToken, withUserVault } from './index.test.config';
import type { CollectKycDataProps } from './types';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<CollectKycData />', () => {
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
    mockRouter.query = {
      public_key: 'ob_test_yK7Wn5qL7xUSlvhG6AZQuY',
    };
  });

  afterEach(() => {
    queryCache.clear();
  });

  const renderPlugin = ({ idvContext, context, onDone }: CollectKycDataProps) =>
    render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <DesignSystemProvider theme={themes.light}>
            <ToastProvider>
              <Layout>
                <CollectKycData idvContext={idvContext} context={context} onDone={onDone} />
              </Layout>
            </ToastProvider>
          </DesignSystemProvider>
        </QueryClientProvider>
      </React.StrictMode>,
    );

  const onboardingConfig: PublicOnboardingConfig = {
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

  const getContext = (attributes: CollectedKycDataOption[], onDone: () => void): CollectKycDataProps => ({
    idvContext: {
      authToken: 'token',
      device: {
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      },
    },
    context: {
      requirement: {
        kind: OnboardingRequirementKind.collectKycData,
        isMet: false,
        missingAttributes: attributes ?? [],
        populatedAttributes: [],
        optionalAttributes: [],
        recollectAttributes: [],
      },
      bootstrapUserData: {
        [IdDI.email]: {
          value: 'piip@onefootprint.com',
          isBootstrap: true,
        },
      },
      config: onboardingConfig,
    },
    onDone,
  });

  describe('when there are missing attributes', () => {
    beforeEach(() => {
      withUserToken();
      withOnboardingConfig();
      withUserVault();
      withIdentify();
    });

    it('takes user through all of the pages', async () => {
      const onDone = jest.fn();

      renderPlugin(
        getContext([CollectedKycDataOption.name, CollectedKycDataOption.dob, CollectedKycDataOption.ssn4], onDone),
      );

      await waitFor(() => {
        expect(screen.getByText('Basic Data')).toBeInTheDocument();
      });

      let firstName = screen.getByLabelText('First name');
      expect(firstName).toBeInTheDocument();
      await userEvent.type(firstName, 'Piip');
      expect(firstName).toHaveValue('Piip');

      let middleName = screen.getByLabelText('Middle name (optional)');
      expect(middleName).toBeInTheDocument();
      await userEvent.type(middleName, 'Middle');
      expect(middleName).toHaveValue('Middle');

      let lastName = screen.getByLabelText('Last name');
      expect(lastName).toBeInTheDocument();
      await userEvent.type(lastName, 'Test');
      expect(lastName).toHaveValue('Test');

      let dob = screen.getByLabelText('Date of Birth');
      expect(dob).toBeInTheDocument();
      await userEvent.type(dob, '01/01/1990');
      expect(dob).toHaveValue('01/01/1990');

      let submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('What are the last 4 digits of your Social Security Number?')).toBeInTheDocument();
      });

      let ssn4 = screen.getByLabelText('SSN (last 4)');
      expect(ssn4).toBeInTheDocument();
      await userEvent.type(ssn4, '1234');

      submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your personal data')).toBeInTheDocument();
      });

      firstName = screen.getByText('Piip');
      expect(firstName).toBeInTheDocument();

      middleName = screen.getByText('Middle');
      expect(middleName).toBeInTheDocument();

      lastName = screen.getByText('Test');
      expect(lastName).toBeInTheDocument();

      dob = screen.getByText('01/01/1990');
      expect(dob).toBeInTheDocument();

      ssn4 = screen.getByText('••••');
      expect(ssn4).toBeInTheDocument();

      // check that we can edit a field, cancel it, and the original value stays as it was

      let basicInfoSection = screen.getByTestId('basic-info-section');
      let basicInfoSectionEdit = within(basicInfoSection).getByRole('button', {
        name: 'Edit',
      });
      await userEvent.click(basicInfoSectionEdit);

      // make sure editing screen has loaded
      await waitFor(() => {
        expect(screen.getByLabelText('First name')).toBeInTheDocument();
      });

      firstName = screen.getByLabelText('First name');
      // await userEvent.clear(firstName);
      await userEvent.type(firstName, 'Test first name');

      let cancel = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(cancel);
      await waitFor(() => {
        expect(screen.getByText('Piip')).toBeInTheDocument();
      });

      // now, edit and make sure the value saves and changes
      basicInfoSection = screen.getByTestId('basic-info-section');
      basicInfoSectionEdit = within(basicInfoSection).getByRole('button', {
        name: 'Edit',
      });
      await userEvent.click(basicInfoSectionEdit);

      // make sure editing screen has loaded
      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });

      firstName = screen.getByLabelText('First name');
      await userEvent.clear(firstName);
      await userEvent.type(firstName, 'Test first name');

      let save = within(basicInfoSection).getByRole('button', {
        name: 'Save',
      });
      await userEvent.click(save);
      await waitFor(() => {
        expect(screen.getByText('Test first name')).toBeInTheDocument();
      });

      // see if edit button shows up in basic info section again
      basicInfoSection = screen.getByTestId('basic-info-section');
      basicInfoSectionEdit = within(basicInfoSection).getByRole('button', {
        name: 'Edit',
      });
      await waitFor(() => {
        expect(basicInfoSectionEdit).toBeInTheDocument();
      });

      // same tests on identity form
      let identitySection = screen.getByTestId('identity-section');
      let identitySectionEdit = within(identitySection).getByRole('button', {
        name: 'Edit',
      });
      await userEvent.click(identitySectionEdit);

      // make sure editing screen has loaded
      await waitFor(() => {
        expect(screen.getByLabelText('SSN (last 4)')).toBeInTheDocument();
      });

      // check that we can edit SSN section, cancel the change, and the original value persists
      ssn4 = screen.getByLabelText('SSN (last 4)');
      await userEvent.clear(ssn4);
      await userEvent.type(ssn4, '5678');

      cancel = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(cancel);
      await waitFor(() => {
        expect(screen.getByText('••••')).toBeInTheDocument();
      });

      // now, edit SSN, save the change, and show that changed value persists
      identitySection = screen.getByTestId('identity-section');
      identitySectionEdit = within(identitySection).getByRole('button', {
        name: 'Edit',
      });
      await userEvent.click(identitySectionEdit);

      // make sure editing screen has loaded
      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });

      ssn4 = screen.getByLabelText('SSN (last 4)');
      await userEvent.clear(ssn4);
      await userEvent.type(ssn4, '5678');
      save = within(identitySection).getByRole('button', {
        name: 'Save',
      });
      await userEvent.click(save);
      await waitFor(() => {
        expect(screen.getByText('••••')).toBeInTheDocument();
      });

      // see if edit button shows up in identity section again (because we are done editing)

      identitySection = screen.getByTestId('identity-section');
      identitySectionEdit = within(identitySection).getByRole('button', {
        name: 'Edit',
      });
      await waitFor(() => {
        expect(identitySectionEdit).toBeInTheDocument();
      });

      submitButton = screen.getByRole('button', { name: 'Confirm & Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });
});
