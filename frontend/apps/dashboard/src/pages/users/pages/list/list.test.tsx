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

describe.skip('<List />', () => {
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

  const renderListAndWaitData = async () => {
    renderEntities();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when the request to fetch the users succeeds', () => {
    beforeEach(() => {
      withEntities();
    });

    it('should show an empty state if no results are found', async () => {
      withEntities([]);
      renderEntities();

      await waitFor(() => {
        const feedback = screen.getByText('No users found');
        expect(feedback).toBeInTheDocument();
      });
    });

    describe('when the tenant has some onboarding configurations', () => {
      beforeEach(() => {
        withOnboardingConfigs();
      });

      it("shouldn't show any onboarding dialog", async () => {
        await renderListAndWaitData();

        const dialog = screen.queryByRole('dialog', {
          name: 'Welcome to Footprint!',
        });
        expect(dialog).not.toBeInTheDocument();
      });
    });

    describe("when the tenant doesn't have any onboarding configurations", () => {
      beforeEach(() => {
        withEntities([]);
        withOnboardingConfigs([]);
      });

      it('should shown an onboarding dialog', async () => {
        await renderListAndWaitData();

        await waitFor(() => {
          const dialog = screen.getByRole('dialog', {
            name: 'Welcome to Footprint!',
          });
          expect(dialog).toBeInTheDocument();
        });
      });
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
