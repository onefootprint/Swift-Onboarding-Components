import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';

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

        await waitFor(() => {
          const loading = screen.queryByLabelText('API creation dialog loading');
          expect(loading).not.toBeInTheDocument();
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
        const loading = screen.queryByLabelText('API creation dialog loading');
        expect(loading).not.toBeInTheDocument();
      });

      const roleSelect = screen.getByRole('option', { name: 'Member' });
      await userEvent.click(roleSelect);
      const adminOption = screen.getByRole('option', { name: 'Admin' });
      await userEvent.click(adminOption);

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Creating secret key...')).toBeInTheDocument();
      });
    });
  });
});
