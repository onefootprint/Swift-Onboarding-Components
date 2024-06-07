import { createUseRouterSpy, customRender, screen, waitFor, within } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import List from './list';
import { withEntities, withEntitiesError, withOnboardingConfigs } from './list.test.config';

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

    it.each`
      id                                 | status    | createdAt
      ${'fp_bid_VXND11zUVRYQKKUxbUN3KD'} | ${'Pass'} | ${'3/27/23, 2:43 PM'}
      ${'fp_id_tvfUNdGqmk2kJyyka9gX22'}  | ${'Fail'} | ${'10/19/23, 3:38 AM'}
    `(
      'should show the id, onboarding status, created and other details for id=$id, status=$status, createdAt=$createdAt',
      async ({ id, status, createdAt }) => {
        await renderListAndWaitData();

        const row = screen.getByRole('row', {
          name: id,
        });

        const foundId = within(row).getByText(id);
        expect(foundId).toBeInTheDocument();

        const foundStatus = within(row).getByText(status);
        expect(foundStatus).toBeInTheDocument();

        const foundCreatedAt = within(row).getByText(createdAt);
        expect(foundCreatedAt).toBeInTheDocument();
      },
    );

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
