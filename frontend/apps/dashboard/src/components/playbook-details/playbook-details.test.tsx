import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import PlaybookDetails from './playbook-details';
import {
  entityIdFixture,
  playbookDetailsFixture,
  withPlaybookDetails,
  withPlaybookDetailsError,
} from './playbook-details.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<PlaybookDetails />', () => {
  const renderDetails = () => {
    customRender(<PlaybookDetails />);
  };

  const renderDetailsAndWaitFinishLoading = async () => {
    renderDetails();
    const loading = await screen.findByTestId('onboarding-configs-details-loading');
    await waitForElementToBeRemoved(loading);
  };

  describe('when the request to fetch the onboarding config details fails', () => {
    beforeEach(() => {
      useRouterSpy({
        asPath: `/playbooks/${playbookDetailsFixture.id}`,
        pathname: `/playbooks/${playbookDetailsFixture.id}`,
        query: {
          id: playbookDetailsFixture.id,
        },
      });
      withPlaybookDetailsError(playbookDetailsFixture.id);
    });

    it('should show the error message', async () => {
      renderDetails();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch from Playbooks succeeds', () => {
    beforeEach(() => {
      withPlaybookDetails(playbookDetailsFixture.id);
    });

    it('should show the correct breadcrumb', async () => {
      useRouterSpy({
        asPath: `/playbooks/${playbookDetailsFixture.id}`,
        pathname: `/playbooks/${playbookDetailsFixture.id}`,
        query: {
          id: playbookDetailsFixture.id,
        },
      });
      await renderDetailsAndWaitFinishLoading();

      const breadcrumb = screen.getByRole('navigation', {
        name: 'playbook details breadcrumb',
      });
      expect(
        within(breadcrumb).getByRole('link', {
          name: 'Playbooks',
        }),
      ).toBeInTheDocument();
      expect(within(breadcrumb).getByText(playbookDetailsFixture.name)).toBeInTheDocument();
    });

    it.skip('should preserve list pagination when navigating back using the breadcrumb', async () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        asPath: `/playbooks/${playbookDetailsFixture.id}`,
        pathname: `/playbooks/${playbookDetailsFixture.id}`,
        query: {
          id: playbookDetailsFixture.id,
          onboarding_configs_page: 4,
        },
        push: pushMockFn,
      });
      await renderDetailsAndWaitFinishLoading();

      const listLink = screen.getByRole('link', {
        name: 'Playbooks',
      });
      await userEvent.click(listLink);

      await waitFor(() => {
        expect(pushMockFn).toHaveBeenCalledWith(
          {
            pathname: '/playbooks',
            query: {
              onboarding_configs_page: 4,
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });
  });

  describe('when the request to fetch from User details succeeds', () => {
    beforeEach(() => {
      useRouterSpy({
        asPath: `/users/${entityIdFixture}/playbook/${playbookDetailsFixture.id}`,
        pathname: `/users/${entityIdFixture}/playbook/${playbookDetailsFixture.id}`,
        query: {
          id: entityIdFixture,
          playbook_id: playbookDetailsFixture.id,
        },
      });
      withPlaybookDetails(playbookDetailsFixture.id);
    });

    it('should show the correct breadcrumb', async () => {
      await renderDetailsAndWaitFinishLoading();

      const breadcrumb = screen.getByRole('navigation', {
        name: 'playbook details breadcrumb',
      });
      expect(
        within(breadcrumb).getByRole('link', {
          name: 'Users',
        }),
      ).toBeInTheDocument();
      expect(
        within(breadcrumb).getByRole('link', {
          name: 'User details',
        }),
      ).toBeInTheDocument();
      expect(within(breadcrumb).getByText('Playbook details')).toBeInTheDocument();
    });

    it.skip('should preserve list filters when navigating back using the breadcrumb', async () => undefined);
  });
});
