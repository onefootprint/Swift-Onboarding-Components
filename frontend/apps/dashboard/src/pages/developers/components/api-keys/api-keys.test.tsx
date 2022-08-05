import React from 'react';
import {
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from 'test-utils';

import ApiKeys from './api-keys';
import {
  createdApiKeyFixture,
  listApiKeysFixture,
  withApiKeys,
  withApiKeysError,
  withCreateApiKeys,
  withCreateApiKeysError,
} from './api-keys.test.config';

describe('<ApiKeys />', () => {
  const renderDevelopers = () => {
    customRender(<ApiKeys />);
  };

  describe('list the api keys', () => {
    describe('when listing the secret keys with error', () => {
      beforeAll(() => {
        withApiKeysError();
      });

      it('should show a spinner and then an error message', async () => {
        renderDevelopers();

        await waitFor(() => {
          const spinner = screen.getByRole('progressbar', {
            name: 'Loading api keys...',
          });
          expect(spinner).toBeInTheDocument();
        });

        const table = within(screen.getByTestId('api-keys-section')).getByRole(
          'table',
        );

        await waitFor(() => {
          expect(
            within(table).getByText('Something went wrong'),
          ).toBeInTheDocument();
        });
      });
    });

    describe('when listing the secret keys with success', () => {
      beforeAll(() => {
        withApiKeys();
      });

      it('should show a spinner and the data within the table', async () => {
        renderDevelopers();
        const loading = screen.getByRole('progressbar', {
          name: 'Loading api keys...',
        });
        await waitForElementToBeRemoved(loading);
        const table = within(screen.getByTestId('api-keys-section')).getByRole(
          'table',
        );
        const [firstApiKey] = listApiKeysFixture;
        const tr = within(table).getByTestId(firstApiKey.id);

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

  describe('create a new key', () => {
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

    describe('when creating a new secret key with error', () => {
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

        const submitButton = screen.getByRole('button', { name: 'Create' });
        await userEvent.click(submitButton);

        const submitButtonLoading = screen.getByLabelText(
          'Creating secret key...',
        );
        await waitFor(() => {
          expect(submitButtonLoading).toBeInTheDocument();
        });

        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });

    describe('when creating a new secret key with success', () => {
      beforeEach(() => {
        withCreateApiKeys();
      });

      it('should show a spinner, close the dialog, show a confirmation and display the new key created', async () => {
        renderDevelopers();

        const keyName = 'Lorem Bank';

        const openDialogButton = screen.getByRole('button', {
          name: 'Create secret key',
        });
        await userEvent.click(openDialogButton);

        const input = screen.getByLabelText('Secret key name');
        await userEvent.type(input, keyName);

        const submitButton = screen.getByRole('button', { name: 'Create' });
        await userEvent.click(submitButton);

        withApiKeys([...listApiKeysFixture, createdApiKeyFixture]);

        const submitButtonLoading = screen.getByLabelText(
          'Creating secret key...',
        );
        await waitFor(() => {
          expect(submitButtonLoading).toBeInTheDocument();
        });

        const dialog = screen.getByRole('dialog', {
          name: 'Create secret key',
        });
        await waitForElementToBeRemoved(dialog);

        await waitFor(() => {
          const successMessage = 'Secret key created successfully.';
          expect(screen.getByText(successMessage)).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(screen.getByText(keyName)).toBeInTheDocument();
        });
      });
    });
  });
});
