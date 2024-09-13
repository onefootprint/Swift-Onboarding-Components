import { customRender, mockRouter, screen, selectEvents, userEvent, waitFor } from '@onefootprint/test-utils';
import { asAdminUser } from 'src/config/tests';
import { useStore } from 'src/hooks/use-session';

import Onboarding from './onboarding';
import {
  withInProgressOnboarding,
  withInviteMember,
  withNoInProgressOnboardings,
  withOrg,
  withRoles,
  withUpdateOrg,
  withUpdateUser,
} from './onboarding.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Onboarding />', () => {
  const renderOnboarding = () => customRender(<Onboarding />);

  beforeEach(() => {
    mockRouter.setCurrentUrl('/onboarding');
  });

  beforeEach(() => {
    asAdminUser();
  });

  beforeEach(() => {
    withOrg();
    withUpdateUser();
    withUpdateOrg();
    withRoles();
    withInviteMember();
  });

  describe('when completing all the step and no in-progress onboardings', () => {
    beforeEach(() => {
      withNoInProgressOnboardings();
    });

    it('should redirect to the /users page', async () => {
      renderOnboarding();

      // 1st step
      const welcomeStep = await screen.findByText('Welcome to Footprint!');
      expect(welcomeStep).toBeInTheDocument();

      await userEvent.click(await screen.findByRole('button', { name: 'Next' }));

      // 2nd step
      // User information
      await screen.findByText('Tell us about you');

      const firstNameField = screen.getByLabelText('First name');
      await userEvent.type(firstNameField, 'Jane');

      const lastNameField = screen.getByLabelText('Last name');
      await userEvent.type(lastNameField, 'Doe');

      await userEvent.click(await screen.findByRole('button', { name: 'Next' }));

      // 3rd step
      // Company data
      await screen.findByText('Tell us about your company');
      await screen.findByTestId('onboarding-company-data-content');
      await screen.findByRole('button', { name: 'Next' });

      const companyNameField = screen.getByLabelText('Company name');
      await userEvent.type(companyNameField, 'Acme Inc.');

      const companyWebsiteField = screen.getByLabelText('Company website');
      await userEvent.type(companyWebsiteField, 'https://www.acme.com');

      const companySizeTrigger = await screen.findByRole('button', { name: 'Select' });
      await selectEvents.select(companySizeTrigger, '1-10');

      await userEvent.click(await screen.findByRole('button', { name: 'Next' }));

      // 4th step
      // Invite members
      await screen.findByTestId('onboarding-invite-content');
      await screen.findByRole('button', { name: 'Go to dashboard' });

      await userEvent.click(await screen.findByRole('button', { name: 'Go to dashboard' }));
      await waitFor(() => {
        expect(mockRouter).toMatchObject({
          pathname: '/users',
        });
      });

      await waitFor(() => {
        const requiresOnboarding = useStore.getState().data?.meta.requiresOnboarding;
        expect(requiresOnboarding).toBeFalsy();
      });
    });
  });

  describe('when there is an in-progress onboarding', () => {
    it('should show a takeover', async () => {
      withInProgressOnboarding();
      renderOnboarding();

      const takeover = await screen.findByLabelText('You may be here unintentionally.');
      expect(takeover).toBeInTheDocument();
    });

    it('should show the takeover again when user clicks "cancel" in the confirm dialog', async () => {
      withInProgressOnboarding();
      renderOnboarding();

      const createBizAccount = await screen.findByRole('button', { name: 'No, create a Footprint business account' });
      await userEvent.click(createBizAccount);

      const confirmCancelButton = await screen.findByRole('button', { name: 'Cancel' });
      await userEvent.click(confirmCancelButton);

      const takeover = await screen.findByLabelText('You may be here unintentionally.');
      expect(takeover).toBeInTheDocument();
    });

    it('should close the takeover and navigate to business account creation when the user clicks on the create button and confirms', async () => {
      withInProgressOnboarding();
      renderOnboarding();

      const createBizAccount = await screen.findByRole('button', { name: 'No, create a Footprint business account' });
      await userEvent.click(createBizAccount);

      const createBizAccountConfirm = await screen.findByRole('button', { name: 'Create business account' });
      await userEvent.click(createBizAccountConfirm);

      const takeover = screen.queryByLabelText('You may be here unintentionally.');
      expect(takeover).not.toBeInTheDocument();

      const fpWelcomeTitle = await screen.findByText('Welcome to Footprint!');
      expect(fpWelcomeTitle).toBeInTheDocument();

      const fpWelcomeSubtitle = await screen.findByText(
        'Your account is almost ready. We just need a bit more information about you and your company.',
      );
      expect(fpWelcomeSubtitle).toBeInTheDocument();
    });
  });
});
