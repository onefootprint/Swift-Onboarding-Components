import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';

import type { InviteProps } from './invite';
import Invite from './invite';
import {
  withInviteMember,
  withInviteMemberError,
  withOrg,
  withOrgError,
  withRoles,
  withRolesError,
} from './invite.test.config';

describe('<Invite />', () => {
  const renderInvite = ({ onComplete = jest.fn() }: Partial<InviteProps>) =>
    customRender(<Invite onComplete={onComplete} onBack={() => undefined} />);

  const renderInviteAndWaitData = async ({ onBack = jest.fn(), onComplete = jest.fn() }: Partial<InviteProps>) => {
    renderInvite({ onComplete, onBack });
    await waitFor(() => {
      screen.getByTestId('onboarding-invite-content');
    });
    await waitFor(() => {
      screen.getByRole('button', { name: 'Go to dashboard' });
    });
  };

  describe('when the request to fetch the roles is loading', () => {
    beforeEach(() => {
      withOrg();
      withRoles();
    });

    it('should show a loading state', () => {
      renderInvite({});

      const loading = screen.getByTestId('onboarding-invite-loading');
      expect(loading).toBeInTheDocument();
    });
  });

  describe('when the request to fetch the roles fails', () => {
    beforeEach(() => {
      withOrg();
      withRolesError();
    });

    it('should show an error message', async () => {
      renderInvite({});

      const error = await screen.findByText('Something went wrong');
      expect(error).toBeInTheDocument();
    });
  });

  describe('when the request to fetch the org fails', () => {
    beforeEach(() => {
      withOrgError();
      withRoles();
    });

    it('should show an error message', async () => {
      renderInvite({});

      const error = await screen.findByText('Something went wrong');
      expect(error).toBeInTheDocument();
    });
  });

  describe('when the request to fetch the roles succeeds', () => {
    beforeEach(() => {
      withOrg();
      withRoles();
    });

    it('should show one invite field with the admin role as default option', async () => {
      await renderInviteAndWaitData({});

      const emailField = screen.getByLabelText('Email address');
      expect(emailField).toBeInTheDocument();

      const roleField = screen.getByRole('button', { name: 'Admin' });
      expect(roleField).toBeInTheDocument();
    });

    describe('when clicking on the add more button', () => {
      it('should add a new invite field', async () => {
        await renderInviteAndWaitData({});

        const addMoreButton = screen.getByRole('button', { name: 'Add more' });
        await userEvent.click(addMoreButton);

        const emailFields = screen.getAllByPlaceholderText('jane.doe@acme.com');
        await waitFor(() => {
          expect(emailFields).toHaveLength(2);
        });
      });
    });

    describe('when submitting the form', () => {
      describe('when the request to invite a member succeeds', () => {
        beforeEach(() => {
          withInviteMember();
        });

        it('should invite the member and trigger onComplete', async () => {
          const onComplete = jest.fn();
          await renderInviteAndWaitData({ onComplete });

          const emailField = screen.getByLabelText('Email address');
          await userEvent.type(emailField, 'jane.doe@acme.com');

          const submitButton = screen.getByRole('button', {
            name: 'Go to dashboard',
          });
          await userEvent.click(submitButton);
          await waitFor(() => {
            expect(onComplete).toHaveBeenCalled();
          });
        });
      });

      describe('when the request to invite a member fails', () => {
        beforeEach(() => {
          withInviteMemberError();
        });

        it('should invite the member and trigger onComplete', async () => {
          await renderInviteAndWaitData({});

          const emailField = screen.getByLabelText('Email address');
          await userEvent.type(emailField, 'jane.doe@acme.com');

          const submitButton = screen.getByRole('button', {
            name: 'Go to dashboard',
          });
          await userEvent.click(submitButton);

          const error = await screen.findByText('Something went wrong');
          expect(error).toBeInTheDocument();
        });
      });
    });
  });
});
