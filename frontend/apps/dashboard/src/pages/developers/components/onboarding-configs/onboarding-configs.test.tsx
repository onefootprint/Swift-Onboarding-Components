import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import OnboardingConfigs from './onboarding-configs';
import {
  onboardingConfigsFixture,
  withEntities,
  withOnboardingConfigs,
  withOnboardingConfigsError,
} from './onboarding-configs.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<OnboardingConfigs />', () => {
  const renderOnboardingConfigs = () => customRender(<OnboardingConfigs />);

  const renderOnboardingConfigsAndWaitData = async () => {
    renderOnboardingConfigs();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  beforeAll(() => {
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  beforeEach(() => {
    useRouterSpy({
      pathname: '/developers',
      query: {
        tab: 'onboarding-configs',
      },
    });
    withEntities();
  });

  describe('when the request to fetch onboarding configs succeeds', () => {
    describe('when there are no onboarding configs', () => {
      beforeEach(() => {
        withOnboardingConfigs([]);
      });

      it('should show empty state', async () => {
        await renderOnboardingConfigsAndWaitData();

        const emptyState = screen.getByText(
          "You haven't created any vault onboarding configurations just yet.",
        );
        expect(emptyState).toBeInTheDocument();
      });
    });

    describe('when there are onboarding configs', () => {
      beforeEach(() => {
        withOnboardingConfigs();
      });

      it('should show the title and subtitle', async () => {
        await renderOnboardingConfigsAndWaitData();

        const title = screen.getByText('Onboarding configurations');
        expect(title).toBeInTheDocument();

        const subtitle = screen.getByText(
          'Set up requirements for customers onboarding onto your platform.',
        );
        expect(subtitle).toBeInTheDocument();
      });

      it('should show the name, key, status and creation date of each onboarding config', async () => {
        await renderOnboardingConfigsAndWaitData();

        onboardingConfigsFixture.forEach(config => {
          const name = screen.getByText(config.name);
          expect(name).toBeInTheDocument();

          const key = screen.getByText(config.key);
          expect(key).toBeInTheDocument();

          const createdAtDateText = new Date(config.created_at).toLocaleString(
            'en-US',
            {
              month: 'numeric',
              day: 'numeric',
              year: '2-digit',
              hour: 'numeric',
              minute: 'numeric',
            },
          );
          const createdAt = screen.getByText(createdAtDateText);
          expect(createdAt).toBeInTheDocument();
        });

        // Test config data includes 1 KYC, 1 KYB onboarding
        expect(screen.getByText('KYC')).toBeInTheDocument();
        expect(screen.getByText('KYB')).toBeInTheDocument();

        // Test config data includes 1 enabled, 1 disabled onboarding
        expect(screen.getByText('Enabled')).toBeInTheDocument();
        expect(screen.getByText('Disabled')).toBeInTheDocument();
      });

      describe('when typing on the table search', () => {
        it('should append email to query', async () => {
          const push = jest.fn();
          useRouterSpy({
            pathname: '/developers',
            query: {
              tab: 'onboarding_configs',
            },
            push,
          });
          await renderOnboardingConfigsAndWaitData();

          const search = screen.getByPlaceholderText('Search...');
          await userEvent.type(search, 'KYC');
          await waitFor(() => {
            expect(push).toHaveBeenCalledWith(
              {
                query: {
                  onboarding_configs_search: 'KYC',
                  tab: 'onboarding_configs',
                },
              },
              undefined,
              { shallow: true },
            );
          });
        });
      });
    });
  });

  describe('when the request to fetch onboarding configs fails', () => {
    beforeEach(() => {
      withOnboardingConfigsError();
    });

    it('should show an error message', async () => {
      await renderOnboardingConfigsAndWaitData();

      const errorMessage = screen.getByText('Something went wrong');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('when clicking create onboarding config button', () => {
    beforeEach(() => {
      withOnboardingConfigs();
    });

    it('should open the create onboarding config dialog', async () => {
      await renderOnboardingConfigsAndWaitData();

      const createButton = screen.getByText('Create onboarding config');
      expect(createButton).toBeInTheDocument();

      await userEvent.click(createButton);

      const dialogTitle = screen.getByTestId(
        'onboarding-configs-create-dialog',
      );
      expect(dialogTitle).toBeInTheDocument();
    });
  });
});
