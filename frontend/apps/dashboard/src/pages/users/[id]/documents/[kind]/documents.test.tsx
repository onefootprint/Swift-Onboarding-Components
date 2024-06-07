import { createUseRouterSpy, customRender, screen, waitFor, waitForElementToBeRemoved } from '@onefootprint/test-utils';
import React from 'react';

import Documents from './documents';
import { entityFixture, withDocuments } from './documents.test.config';

describe('Documents', () => {
  const useRouterSpy = createUseRouterSpy();

  const renderDocuments = () => customRender(<Documents />);

  const renderDocumentsAndWait = async () => {
    renderDocuments();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar', { name: 'Loading documents' }));
  };

  describe('when the document is not found', () => {
    beforeEach(() => {
      withDocuments();
      useRouterSpy({
        pathname: `/users/${entityFixture.id}/documents/lorem`,
        query: {
          id: entityFixture.id,
          kind: 'lorem',
        },
      });
    });

    it('renders a 404 page', async () => {
      renderDocuments();

      await waitFor(() => {
        const title = screen.getByText("Oops! Page couldn't be found.");
        expect(title).toBeInTheDocument();
      });
    });
  });

  describe('when the document is found', () => {
    beforeEach(() => {
      withDocuments();
      useRouterSpy({
        pathname: `/users/${entityFixture.id}/documents/drivers_license`,
        query: {
          id: entityFixture.id,
          kind: 'drivers_license',
        },
      });
    });

    describe('when the data is encrypted', () => {
      it('should show a banner saying the data is encrypted', async () => {
        await renderDocumentsAndWait();

        await waitFor(() => {
          const banner = screen.getByText('This data is encrypted for this user. Please decrypt to reveal.');
          expect(banner).toBeInTheDocument();
        });
      });
    });

    describe('session selector', () => {
      describe('when there is no query parameter with session', () => {
        it('should show the first session selected', async () => {
          await renderDocumentsAndWait();

          const select = screen.getByText('4/29/24, 6:38 PM');
          expect(select).toBeInTheDocument();
        });
      });

      describe('when there is a query parameter with session', () => {
        it('should show the session selected', async () => {
          useRouterSpy({
            pathname: `/users/${entityFixture.id}/documents/drivers_license`,
            query: {
              id: entityFixture.id,
              kind: 'drivers_license',
              session: '2024-04-30T19%3A56%3A43.368966Z',
            },
          });

          await renderDocumentsAndWait();

          const select = screen.getByText('4/30/24, 7:56 PM');
          expect(select).toBeInTheDocument();
        });
      });
    });
  });
});
