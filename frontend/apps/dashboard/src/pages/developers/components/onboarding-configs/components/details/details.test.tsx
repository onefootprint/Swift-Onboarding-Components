import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import Details from './details';
import {
  onboardingConfigDetailsFixture,
  withEditOnboardingConfig,
  withOnboardingConfigDetails,
  withOnboardingConfigDetailsError,
} from './details.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Details />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/developers',
      query: {
        tab: 'onboarding-configs',
        onboarding_config_id: onboardingConfigDetailsFixture.id,
      },
    });
  });

  const renderDetails = () => {
    customRender(<Details />);
  };

  const renderDetailsAndWaitData = async () => {
    renderDetails();

    await waitFor(() => {
      const content = screen.getByTestId('onboarding-configs-details-content');
      expect(content).toBeInTheDocument();
    });
  };

  describe('when the request to fetch the onboarding config details fails', () => {
    beforeEach(() => {
      withOnboardingConfigDetailsError(onboardingConfigDetailsFixture.id);
    });

    it('should show the error message', async () => {
      renderDetails();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch the onboarding config details succeeds', () => {
    beforeEach(() => {
      withOnboardingConfigDetails(onboardingConfigDetailsFixture.id);
    });

    it('should show the onboarding config details', async () => {
      await renderDetailsAndWaitData();

      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('KYC')).toBeInTheDocument();

      expect(screen.getByText('Publishable key')).toBeInTheDocument();
      expect(
        screen.getByText(onboardingConfigDetailsFixture.key),
      ).toBeInTheDocument();
    });

    it('should show collected data & access permission scope', async () => {
      await renderDetailsAndWaitData();

      expect(screen.getByText('Collected data')).toBeInTheDocument();

      const collectedDataContainer = screen.getByTestId('kyc-collected-data');
      const email = within(collectedDataContainer).getByText('Email');
      expect(email).toBeInTheDocument();

      const phone = within(collectedDataContainer).getByText('Phone number');
      expect(phone).toBeInTheDocument();

      let ssn4 = within(collectedDataContainer).getByText('SSN (Last 4)');
      expect(ssn4).toBeInTheDocument();

      expect(screen.getByText('Access permission scope')).toBeInTheDocument();

      const accessedDataContainer = screen.getByTestId('kyc-accessed-data');
      ssn4 = within(accessedDataContainer).getByText('SSN (Last 4)');
      expect(ssn4).toBeInTheDocument();
    });

    describe('when editing the name', () => {
      const newName = 'New name';

      beforeEach(() => {
        withEditOnboardingConfig(onboardingConfigDetailsFixture, {
          name: newName,
        });
      });

      it('should update the name', async () => {
        await renderDetailsAndWaitData();

        const editButton = screen.getByRole('button', {
          name: 'Edit',
        });
        await userEvent.click(editButton);

        const nameInput = screen.getByTestId('name-input');
        await waitFor(() => {
          expect(nameInput).toBeInTheDocument();
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, newName);

        const saveButton = screen.getByRole('button', {
          name: 'Save',
        });
        await userEvent.click(saveButton);

        await waitFor(() => {
          const feedback = screen.getByText('Onboarding configuration updated');
          expect(feedback).toBeInTheDocument();
        });

        await waitFor(() => {
          const name = screen.getByText(newName);
          expect(name).toBeInTheDocument();
        });
      });
    });
  });
});
