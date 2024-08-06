import { createUseRouterSpy, customRender, screen, selectEvents, userEvent, waitFor } from '@onefootprint/test-utils';
import { asAdminUser, resetUser } from 'src/config/tests';
import { useStore } from 'src/hooks/use-session';

import Onboarding from './onboarding';
import { withInviteMember, withOrg, withRoles, withUpdateOrg, withUpdateUser } from './onboarding.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Onboarding />', () => {
  const renderOnboarding = () => customRender(<Onboarding />);

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

  afterAll(() => {
    resetUser();
  });

  describe('when completing all the steps', () => {
    const push = jest.fn();

    useRouterSpy({
      pathname: '/onboarding',
      query: {},
      push,
    });

    it('should redirect to the /users page', async () => {
      renderOnboarding();

      // 1st step
      await waitFor(() => {
        screen.getByText('Welcome to Footprint!');
      });
      const welcomeStep = screen.getByText('Welcome to Footprint!');
      expect(welcomeStep).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 2nd step
      // User information
      await waitFor(() => {
        screen.getByText('Tell us about you');
      });

      const firstNameField = screen.getByLabelText('First name');
      await userEvent.type(firstNameField, 'Jane');

      const lastNameField = screen.getByLabelText('Last name');
      await userEvent.type(lastNameField, 'Doe');

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 3rd step
      // Company data
      await waitFor(() => {
        screen.getByText('Tell us about your company');
        screen.getByTestId('onboarding-company-data-content');
        screen.getByRole('button', { name: 'Next' });
      });

      const companyNameField = screen.getByLabelText('Company name');
      await userEvent.type(companyNameField, 'Acme Inc.');

      const companyWebsiteField = screen.getByLabelText('Company website');
      await userEvent.type(companyWebsiteField, 'https://www.acme.com');

      const companySizeTrigger = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(companySizeTrigger, '1-10');

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 4th step
      // Invite members
      await waitFor(() => {
        screen.getByTestId('onboarding-invite-content');
        screen.getByRole('button', { name: 'Go to dashboard' });
      });

      await userEvent.click(screen.getByRole('button', { name: 'Go to dashboard' }));
      await waitFor(() => {
        expect(push).toHaveBeenCalled();
      });

      await waitFor(() => {
        const requiresOnboarding = useStore.getState().data?.meta.requiresOnboarding;
        expect(requiresOnboarding).toBeFalsy();
      });
    });
  });
});
