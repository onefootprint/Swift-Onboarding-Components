import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Provider from '@/entity/hooks/use-entity-context';

import Documents from './documents';
import { entityFixture, entityIdFixture } from './documents.test.config';

describe('Documents', () => {
  const useRouterSpy = createUseRouterSpy();

  const renderDocuments = () =>
    customRender(
      <Provider kind={entityFixture.kind} listPath="">
        <Documents entity={entityFixture} />
      </Provider>,
    );

  describe('when the document is not found', () => {
    beforeEach(() => {
      useRouterSpy({
        pathname: `/users/${entityIdFixture}/documents/lorem`,
        query: {
          id: entityIdFixture,
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
});
