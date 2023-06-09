import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import List from './list';
import {
  withEntities,
  withEntitiesError,
  withOnboardingConfigs,
} from './list.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<List />', () => {
  beforeEach(() => {
    asAdminUser();
    useRouterSpy({
      pathname: '/entities',
      query: {},
    });
    withOnboardingConfigs();
  });

  afterAll(() => {
    resetUser();
  });

  const renderEntities = () => customRender(<List />);

  describe('when the request to fetch the users succeeds', () => {
    beforeEach(() => {
      withEntities();
    });

    it('should show an empty state if no results are found', async () => {
      withEntities([]);
      renderEntities();

      await waitFor(() => {
        const feedback = screen.getByText('No pending manual reviews');
        expect(feedback).toBeInTheDocument();
      });
    });

    describe('when the request to fetch the users fails', () => {
      beforeEach(() => {
        withEntitiesError();
      });

      it('should show an error message', async () => {
        renderEntities();

        await waitFor(() => {
          const feedback = screen.getByText('Something went wrong');
          expect(feedback).toBeInTheDocument();
        });
      });
    });
  });
});
