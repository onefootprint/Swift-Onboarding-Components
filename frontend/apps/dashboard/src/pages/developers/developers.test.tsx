import React from 'react';
import {
  customRender,
  screen,
  waitForElementToBeRemoved,
  within,
} from 'test-utils';

import Developers from './developers';
import {
  apiKeysFixture,
  withApiKeys,
  withApiKeysError,
} from './developers.test.config';

describe('<Developers />', () => {
  const renderDevelopers = () => {
    customRender(<Developers />);
  };

  describe('<ApiKeys />', () => {
    describe('when the request is loading', () => {
      beforeAll(() => {
        withApiKeysError();
      });

      it('should show a spinner while loading', () => {
        renderDevelopers();
        const loading = screen.getByRole('progressbar', {
          name: 'Loading api keys...',
        });
        expect(loading).toBeInTheDocument();
      });
    });

    describe('when the request fails', () => {
      beforeAll(() => {
        withApiKeysError();
      });

      it('should show an error message', async () => {
        renderDevelopers();
        const table = within(screen.getByTestId('api-keys-section')).getByRole(
          'table',
        );
        await within(table).findByText('Something bad happened');
        expect(
          within(table).getByText('Something bad happened'),
        ).toBeInTheDocument();
      });
    });

    describe('when the request succeeds', () => {
      beforeAll(() => {
        withApiKeys();
      });

      it('should show the data', async () => {
        renderDevelopers();
        const loading = screen.getByRole('progressbar', {
          name: 'Loading api keys...',
        });
        await waitForElementToBeRemoved(loading);
        const table = within(screen.getByTestId('api-keys-section')).getByRole(
          'table',
        );
        const [firstApiKey] = apiKeysFixture;
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
});
