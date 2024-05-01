import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import React from 'react';

import Documents from './documents';
import { entityFixture, withDocuments } from './documents.test.config';

describe('Documents', () => {
  const useRouterSpy = createUseRouterSpy();

  const renderDocuments = () => customRender(<Documents />);

  const renderDocumentsAndWait = async () => {
    renderDocuments();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('progressbar', { name: 'Loading documents' }),
    );
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
          const banner = screen.getByText(
            'This data is encrypted for this user. Please decrypt to reveal.',
          );
          expect(banner).toBeInTheDocument();
        });
      });
    });
  });
});
