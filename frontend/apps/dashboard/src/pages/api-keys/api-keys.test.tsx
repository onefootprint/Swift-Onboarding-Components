import {
  customRender,
  screen,
  selectEvents,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import { asAdminUser, resetUser } from 'src/config/tests';

import ApiKeys from './api-keys';
import {
  createdApiKeyFixture,
  listApiKeysFixture,
  withApiKeys,
  withApiKeysError,
  withCreateApiKeys,
  withCreateApiKeysError,
  withRoles,
} from './api-keys.test.config';

describe.skip('<ApiKeys />', () => {
  const renderDevelopers = () => {
    customRender(<ApiKeys />);
  };

  beforeEach(() => {
    withRoles();
  });

  beforeAll(() => {
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  describe('listing the api keys', () => {
    describe('when the request fails', () => {
      beforeAll(() => {
        withApiKeysError();
      });

      it('should show a spinner and then an error message', async () => {
        renderDevelopers();

        await waitFor(() => {
          const table = screen.getByRole('table');
          expect(table.getAttribute('aria-busy')).toBeTruthy();
        });

        await waitFor(() => {
          const table = screen.getByRole('table');
          expect(within(table).getByText('Something went wrong')).toBeInTheDocument();
        });
      });
    });

    describe('when the request succeeds', () => {
      beforeAll(() => {
        withApiKeys();
      });

      it('should show a spinner and the data within the table', async () => {
        renderDevelopers();

        await waitFor(() => {
          const table = screen.getByRole('table');
          const isPending = table.getAttribute('aria-busy');
          expect(isPending).toBe('false');
        });

        const table = screen.getByRole('table');
        const [firstApiKey] = listApiKeysFixture;
        const tr = within(table).getByRole('row', {
          name: firstApiKey.name,
        });

        const name = within(tr).getByText(firstApiKey.name);
        expect(name).toBeInTheDocument();

        const encryptedKey = within(tr).getByText('•••••••••');
        expect(encryptedKey).toBeInTheDocument();

        const createdAt = within(tr).getByText('7/7/22, 4:40 PM');
        expect(createdAt).toBeInTheDocument();

        const lastUsed = within(tr).getByText('7/7/22, 3:40 PM');
        expect(lastUsed).toBeInTheDocument();

        const status = within(tr).getByText('Enabled', { exact: false });
        expect(status).toBeInTheDocument();
      });
    });
  });

  describe('creating a new key', () => {
    beforeAll(() => {
      withApiKeys();
    });

    describe('when clicking on the button "Create secret key"', () => {
      it('should open a dialog to create a new secret key', async () => {
        renderDevelopers();
        const openDialogButton = screen.getByRole('button', {
          name: 'Create secret key',
        });
        await userEvent.click(openDialogButton);

        const dialog = screen.getByRole('dialog', {
          name: 'Create secret key',
        });
        expect(dialog).toBeInTheDocument();
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        withCreateApiKeysError();
      });

      it('should show a spinner and then an error message', async () => {
        renderDevelopers();

        const keyName = 'Lorem Bank';

        const openDialogButton = screen.getByRole('button', {
          name: 'Create secret key',
        });
        await userEvent.click(openDialogButton);

        const input = screen.getByLabelText('Secret key name');
        await userEvent.type(input, keyName);

        await waitFor(() => {
          expect(screen.queryByTestId('members-roles-loading')).not.toBeInTheDocument();
        });

        const roleSelect = screen.getByRole('button', { name: 'Select role' });
        await selectEvents.select(roleSelect, 'Admin');

        const submitButton = screen.getByRole('button', { name: 'Create' });
        await userEvent.click(submitButton);

        const submitButtonLoading = screen.getByLabelText('Creating secret key...');
        await waitFor(() => {
          expect(submitButtonLoading).toBeInTheDocument();
        });

        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        withCreateApiKeys();
      });

      it('should show a spinner, close the dialog and show the key created', async () => {
        renderDevelopers();

        const keyName = 'Lorem Bank';

        const openDialogButton = screen.getByRole('button', {
          name: 'Create secret key',
        });
        await userEvent.click(openDialogButton);

        const input = screen.getByLabelText('Secret key name');
        await userEvent.type(input, keyName);

        await waitFor(() => {
          expect(screen.queryByTestId('members-roles-loading')).not.toBeInTheDocument();
        });

        const roleSelect = screen.getByRole('button', { name: 'Select role' });
        await selectEvents.select(roleSelect, 'Admin');

        const submitButton = screen.getByRole('button', { name: 'Create' });
        await userEvent.click(submitButton);

        withApiKeys([...listApiKeysFixture, createdApiKeyFixture]);

        const submitButtonLoading = screen.getByLabelText('Creating secret key...');
        await waitFor(() => {
          expect(submitButtonLoading).toBeInTheDocument();
        });

        const dialog = screen.getByRole('dialog', {
          name: 'Create secret key',
        });
        await waitForElementToBeRemoved(dialog);

        await waitFor(() => {
          expect(screen.getByText(keyName)).toBeInTheDocument();
        });
      });
    });
  });
});
