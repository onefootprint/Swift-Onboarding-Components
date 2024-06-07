import { customRender, screen, selectEvents, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import CreateDialog from './create-dialog';
import { withApiKeys, withCreateApiKeys, withRoles } from './create-dialog.test.config';

describe('<CreateDialog />', () => {
  const renderCreateDialog = () => {
    customRender(<CreateDialog open onClose={jest.fn()} />);
  };

  beforeEach(() => {
    withRoles();
  });

  describe('successful api keys call', () => {
    beforeEach(() => {
      withApiKeys();
      withCreateApiKeys();
    });

    describe('when submitting an invalid form', () => {
      it('should display an error message', async () => {
        renderCreateDialog();

        const submitButton = screen.getByRole('button', { name: 'Create' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errorMessage = screen.getByText('Please enter a name for your secret key.');
          expect(errorMessage).toBeInTheDocument();
        });
      });

      it('should error if we fail to submit a role', async () => {
        renderCreateDialog();

        const secretKeyName = screen.getByPlaceholderText('Secret key');
        await userEvent.click(secretKeyName);
        await userEvent.type(secretKeyName, 'test name');

        // make sure roles are loaded
        await waitFor(() => {
          expect(screen.queryByTestId('members-roles-loading')).not.toBeInTheDocument();
        });

        const submitButton = screen.getByRole('button', { name: 'Create' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errorMessage = screen.getByText('Please select a role.');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });

    it('should succeed when we submit a valid form', async () => {
      renderCreateDialog();

      const secretKeyName = screen.getByPlaceholderText('Secret key');
      await userEvent.click(secretKeyName);
      await userEvent.type(secretKeyName, 'test name');

      await waitFor(() => {
        expect(screen.queryByTestId('members-roles-loading')).not.toBeInTheDocument();
      });

      const roleSelect = screen.getByRole('button', { name: 'Select role' });
      await selectEvents.select(roleSelect, 'Admin');

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Creating secret key...')).toBeInTheDocument();
      });
    });
  });
});
