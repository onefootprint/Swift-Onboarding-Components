import React from 'react';
import {
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from 'test-utils';

import OnboardingConfigs from './onboarding-configs';
import {
  onboardingConfig,
  withOnboardingConfigs,
  withOnboardingConfigsError,
  withUpdateOnboardingConfigs,
  withUpdateOnboardingConfigsError,
} from './onboarding-configs.test.config';

describe('<OnboardingConfigs />', () => {
  const renderOnboardingConfigs = () => {
    customRender(<OnboardingConfigs />);
  };

  describe('list the api keys', () => {
    describe('when the request fails', () => {
      beforeEach(() => {
        withOnboardingConfigsError();
      });

      it('should show an error message', async () => {
        renderOnboardingConfigs();

        const loadingIndicator = await screen.findByRole('progressbar');
        await waitForElementToBeRemoved(loadingIndicator);

        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });

    describe('when the request succeeds', () => {
      describe('when no data is returned', () => {
        beforeEach(() => {
          withOnboardingConfigs([]);
        });

        it('should show an empty message', async () => {
          renderOnboardingConfigs();

          const loadingIndicator = await screen.findByRole('progressbar');
          await waitForElementToBeRemoved(loadingIndicator);

          await waitFor(() => {
            const emptyMessage = screen.getByText(
              "You haven't created any onboarding configurations just yet.",
            );
            expect(emptyMessage).toBeInTheDocument();
          });
        });
      });

      describe('when some data is returned', () => {
        beforeEach(() => {
          withOnboardingConfigs();
        });

        it('should show the data', async () => {
          renderOnboardingConfigs();

          const item = await screen.findByTestId(
            `onboarding-config-${onboardingConfig.id}`,
          );
          const name = within(item).getByText(onboardingConfig.name);
          expect(name).toBeInTheDocument();
          const createdAt = within(item).getByText('7/20/22, 1:52 AM', {
            exact: false,
          });
          expect(createdAt).toBeInTheDocument();
          const mustCollectList = within(item).getByTestId(
            `must-collect-data-kinds-${onboardingConfig.id}`,
          );
          expect(
            within(mustCollectList).getByText('First name'),
          ).toBeInTheDocument();
          expect(
            within(mustCollectList).getByText('Last name'),
          ).toBeInTheDocument();
          const canAccessList = within(item).getByTestId(
            `can-access-data-kinds-${onboardingConfig.id}`,
          );
          expect(
            within(canAccessList).getByText('Date of birth'),
          ).toBeInTheDocument();
          const onboardingKey = within(item).getByText(onboardingConfig.key);
          expect(onboardingKey).toBeInTheDocument();
          const status = within(item).getByText('Enabled', { exact: false });
          expect(status).toBeInTheDocument();
        });
      });
    });
  });

  describe('when toggling the status', () => {
    beforeEach(() => {
      withOnboardingConfigs();
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        withUpdateOnboardingConfigsError(onboardingConfig);
      });

      it('should rollback to the previous status and show an error notification', async () => {
        renderOnboardingConfigs();
        const item = await screen.findByTestId(
          `onboarding-config-${onboardingConfig.id}`,
        );
        const prevStatus = within(item).getByText('Enabled', {
          exact: false,
        });
        expect(prevStatus).toBeInTheDocument();
        const disableButton = screen.getByRole('button', { name: 'Disable' });
        await userEvent.click(disableButton);
        await waitFor(() => {
          const newStatus = within(item).getByText('Disabled', {
            exact: false,
          });
          expect(newStatus).toBeInTheDocument();
        });
        await waitFor(() => {
          const rollbackStatus = within(item).getByText('Enabled', {
            exact: false,
          });
          expect(rollbackStatus).toBeInTheDocument();
        });
        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        withUpdateOnboardingConfigs({
          prevData: onboardingConfig,
          nextData: { status: 'disabled' },
        });
      });

      it('should change the status from enabled to disabled', async () => {
        renderOnboardingConfigs();
        const item = await screen.findByTestId(
          `onboarding-config-${onboardingConfig.id}`,
        );
        const prevStatus = within(item).getByText('Enabled', {
          exact: false,
        });
        expect(prevStatus).toBeInTheDocument();
        const disableButton = screen.getByRole('button', { name: 'Disable' });
        await userEvent.click(disableButton);
        await waitFor(() => {
          const newStatus = within(item).getByText('Disabled', {
            exact: false,
          });
          expect(newStatus).toBeInTheDocument();
        });
      });
    });
  });

  describe('when updating the name', () => {
    beforeEach(() => {
      withOnboardingConfigs();
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        withUpdateOnboardingConfigsError(onboardingConfig);
      });

      it('should rollback to the previous state and show an error notification', async () => {
        renderOnboardingConfigs();
        const item = await screen.findByTestId(
          `onboarding-config-${onboardingConfig.id}`,
        );

        const button = within(item).getByRole('button', {
          name: 'Edit onboarding config',
        });
        await userEvent.click(button);

        const dialog = screen.getByRole('dialog', {
          name: 'Edit onboarding configuration name',
        });

        const input = screen.getByLabelText('Onboarding configuration name');
        await userEvent.type(input, 'Acme Lorem');

        const submitButton = within(dialog).getByRole('button', {
          name: 'Save',
        });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const newName = within(item).getByText('Acme Lorem', {
            exact: false,
          });
          expect(newName).toBeInTheDocument();
        });
        await waitFor(() => {
          const rollbackName = within(item).getByText('Acme Bank', {
            exact: false,
          });
          expect(rollbackName).toBeInTheDocument();
        });
        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        withUpdateOnboardingConfigs({
          prevData: onboardingConfig,
          nextData: { name: 'Acme Lorem' },
        });
      });

      it('should change the name', async () => {
        renderOnboardingConfigs();
        const item = await screen.findByTestId(
          `onboarding-config-${onboardingConfig.id}`,
        );

        const button = within(item).getByRole('button', {
          name: 'Edit onboarding config',
        });
        await userEvent.click(button);

        const dialog = screen.getByRole('dialog', {
          name: 'Edit onboarding configuration name',
        });

        const input = screen.getByLabelText('Onboarding configuration name');
        await userEvent.type(input, 'Acme Lorem');

        const submitButton = within(dialog).getByRole('button', {
          name: 'Save',
        });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const newName = within(item).getByText('Acme Lorem', {
            exact: false,
          });
          expect(newName).toBeInTheDocument();
        });
      });
    });
  });
});
