import themes from '@onefootprint/design-tokens';
import { createUseRouterSpy, render, screen, userEvent, waitFor, within } from '@onefootprint/test-utils';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import {
  CollectedKybDataOption,
  CollectedKycDataOption,
  IdDI,
  OnboardingConfigStatus,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Layout } from 'src/components/layout';

import type { CollectKybDataProps } from './collect-kyb-data.types';
import CollectKybData from './index';
import {
  withBusinessVault,
  withBusinessVaultValidate,
  withIdentify,
  withOnboardingConfig,
  withUserToken,
  withUserVault,
  withUserVaultValidate,
} from './index.test.config';

describe.skip('<CollectKybData />', () => {
  const useRouterSpy = createUseRouterSpy();
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    logger: {
      log: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    queryCache.clear();
    useRouterSpy({
      pathname: '/',
      query: {
        public_key: 'ob_test_yK7Wn5qL7xUSlvhG6AZQuY',
      },
    });
  });

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

  const getContext = (
    kycAttributes: CollectedKycDataOption[],
    kybAttributes: CollectedKybDataOption[],
    onDone: () => void,
  ): CollectKybDataProps => ({
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
      config: onboardingConfig,
      kybRequirement: {
        kind: OnboardingRequirementKind.collectKybData,
        isMet: false,
        missingAttributes: kybAttributes,
      },
      kycRequirement: {
        kind: OnboardingRequirementKind.collectKycData,
        isMet: false,
        missingAttributes: kycAttributes,
        populatedAttributes: [],
        optionalAttributes: [],
      },
      bootstrapBusinessData: {},
      bootstrapUserData: {
        [IdDI.email]: {
          value: 'piip@onefootprint.com',
          isBootstrap: true,
        },
      },
    },
    onDone,
  });

  const renderPlugin = ({ idvContext, context, onDone }: CollectKybDataProps) =>
    render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <DesignSystemProvider theme={themes.light}>
            <ToastProvider>
              <Layout>
                <CollectKybData idvContext={idvContext} context={context} onDone={onDone} />
              </Layout>
            </ToastProvider>
          </DesignSystemProvider>
        </QueryClientProvider>
      </React.StrictMode>,
    );

  describe('when there are missing attribute', () => {
    beforeEach(() => {
      withUserToken();
      withOnboardingConfig();
      withBusinessVaultValidate();
      withBusinessVault();
      withUserVaultValidate();
      withUserVault();
      withIdentify();
    });

    it('takes user through all of the pages', async () => {
      const onDone = jest.fn();
      renderPlugin(
        getContext(
          [CollectedKycDataOption.name, CollectedKycDataOption.dob, CollectedKycDataOption.ssn4],
          [CollectedKybDataOption.name, CollectedKybDataOption.tin, CollectedKybDataOption.beneficialOwners],
          onDone,
        ),
      );

      await waitFor(() => {
        expect(
          screen.getByText("Let's get to know your business!", {
            exact: false,
          }),
        ).toBeInTheDocument();
      });

      let submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('We need some information about your business.')).toBeInTheDocument();
      });

      let businessName = screen.getByLabelText('Business name');
      expect(businessName).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Acme Bank Inc.')).toBeInTheDocument();
      await userEvent.type(businessName, 'New Biz Inc.');

      const TIN = screen.getByLabelText('Taxpayer Identification Number (TIN)');
      expect(TIN).toBeInTheDocument();
      expect(screen.getByPlaceholderText('12-3456789')).toBeInTheDocument();
      await userEvent.type(TIN, '987654321');

      submitButton = screen.getByRole('button', {
        name: 'Continue',
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Who are the beneficial owners?')).toBeInTheDocument();
      });

      let firstName = screen.getByLabelText('First name');
      expect(firstName).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Jane')).toBeInTheDocument();
      await userEvent.type(firstName, 'John');

      let lastName = screen.getByLabelText('Last name');
      expect(lastName).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
      await userEvent.type(lastName, 'Doe');

      let ownershipStake = screen.getByLabelText('Approximate ownership stake (%)');
      expect(ownershipStake).toBeInTheDocument();
      expect(screen.getByPlaceholderText('25')).toBeInTheDocument();
      await userEvent.type(ownershipStake, '50');

      submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your business data')).toBeInTheDocument();
      });

      firstName = screen.getByText('John');
      expect(firstName).toBeInTheDocument();

      lastName = screen.getByText('Doe');
      expect(lastName).toBeInTheDocument();

      ownershipStake = screen.getByText('50%');
      expect(ownershipStake).toBeInTheDocument();

      let basicDataSection = screen.getByTestId('basic-data');
      let basicDataEdit = within(basicDataSection).getByRole('button', {
        name: 'Edit',
      });
      await userEvent.click(basicDataEdit);

      // check that we can edit a field, cancel it, and the original value stays as it was
      businessName = screen.getByLabelText('Business name');
      await userEvent.type(businessName, 'Newer Biz Inc.');

      let cancel = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(cancel);
      expect(screen.getByText('New Biz Inc.')).toBeInTheDocument();

      // now, edit and make sure the value saves and changes
      basicDataSection = screen.getByTestId('basic-data');
      basicDataEdit = within(basicDataSection).getByRole('button', {
        name: 'Edit',
      });
      await userEvent.click(basicDataEdit);

      businessName = screen.getByLabelText('Business name');
      await userEvent.clear(businessName);
      await userEvent.type(businessName, 'Newer Biz Inc.');

      let save = within(basicDataSection).getByRole('button', {
        name: 'Save',
      });
      await userEvent.click(save);
      await waitFor(() => {
        expect(screen.getByText('Newer Biz Inc.')).toBeInTheDocument();
      });

      // see if edit button shows up in basic section again
      basicDataSection = screen.getByTestId('basic-data');
      basicDataEdit = within(basicDataSection).getByRole('button', {
        name: 'Edit',
      });
      await waitFor(() => {
        expect(basicDataEdit).toBeInTheDocument();
      });

      // edit a beneficial owner
      let beneficialOwnersSection = screen.getByTestId('beneficial-owners');
      let beneficialOwnersEdit = within(beneficialOwnersSection).getByRole('button', { name: 'Edit' });
      await userEvent.click(beneficialOwnersEdit);

      // check that we can edit approximate ownership, cancel the change, and the original value persists
      await waitFor(() => {
        expect(screen.getByLabelText('Approximate ownership stake (%)')).toBeInTheDocument();
      });
      ownershipStake = screen.getByLabelText('Approximate ownership stake (%)');
      await userEvent.clear(ownershipStake);
      await userEvent.type(ownershipStake, '40');

      cancel = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(cancel);
      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      });

      // now, edit approximate ownership, save the change, and show that changed value persists
      beneficialOwnersSection = screen.getByTestId('beneficial-owners');
      beneficialOwnersEdit = within(beneficialOwnersSection).getByRole('button', { name: 'Edit' });
      await userEvent.click(beneficialOwnersEdit);

      ownershipStake = screen.getByLabelText('Approximate ownership stake (%)');
      await waitFor(() => {
        expect(ownershipStake).toBeInTheDocument();
      });

      await userEvent.clear(ownershipStake);
      await userEvent.type(ownershipStake, '40');
      save = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(save);
      await waitFor(() => {
        expect(screen.getByText('40%')).toBeInTheDocument();
      });

      // see if edit button shows up in beneficial owners section again (because we are done editing)
      beneficialOwnersSection = screen.getByTestId('beneficial-owners');
      beneficialOwnersEdit = within(beneficialOwnersSection).getByRole('button', { name: 'Edit' });
      await waitFor(() => {
        expect(beneficialOwnersEdit).toBeInTheDocument();
      });

      submitButton = screen.getByRole('button', { name: 'Confirm & Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(beneficialOwnersEdit).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(`Basic Data`)).toBeInTheDocument();
      });

      firstName = screen.getByLabelText('First name');
      expect(firstName).toBeInTheDocument();
      expect(firstName).toHaveValue('John');
      expect(firstName).toBeDisabled();

      lastName = screen.getByLabelText('Last name');
      expect(lastName).toBeInTheDocument();
      expect(lastName).toHaveValue('Doe');
      expect(lastName).toBeDisabled();

      const dob = screen.getByLabelText('Date of Birth');
      expect(dob).toBeInTheDocument();
      await userEvent.type(dob, '01/01/1990');
      expect(dob).toHaveValue('01/01/1990');

      submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('What are the last 4 digits of your Social Security Number?')).toBeInTheDocument();
      });

      const ssn4 = screen.getByLabelText('SSN (last 4)');
      expect(ssn4).toBeInTheDocument();
      await userEvent.type(ssn4, '1234');

      submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your personal data')).toBeInTheDocument();
      });

      firstName = screen.getByText('John');
      expect(firstName).toBeInTheDocument();

      lastName = screen.getByText('Doe');
      expect(lastName).toBeInTheDocument();

      const ssn = screen.getByText('1234');
      expect(ssn).toBeInTheDocument();

      submitButton = screen.getByRole('button', { name: 'Confirm & Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });
});
