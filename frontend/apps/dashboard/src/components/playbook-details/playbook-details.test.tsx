import { customRender, mockRouter, screen, waitForElementToBeRemoved, within } from '@onefootprint/test-utils';

import PlaybookDetails from './playbook-details';
import {
  entityIdFixture,
  playbookDetailsFixture,
  withPlaybookDetails,
  withPlaybookDetailsError,
} from './playbook-details.test.config';
jest.mock('next/router', () => jest.requireActual('next-router-mock'));

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
      mockRouter.setCurrentUrl(`/playbooks/${playbookDetailsFixture.id}`);
      mockRouter.query = {
        id: playbookDetailsFixture.id,
      };
      withPlaybookDetailsError(playbookDetailsFixture.id);
    });

    it('should show the error message', async () => {
      renderDetails();

      const feedback = await screen.findByText('Something went wrong');
      expect(feedback).toBeInTheDocument();
    });
  });

  describe('when the request to fetch from Playbooks succeeds', () => {
    beforeEach(() => {
      withPlaybookDetails(playbookDetailsFixture.id);
    });

    it('should show the correct breadcrumb', async () => {
      mockRouter.setCurrentUrl(`/playbooks/${playbookDetailsFixture.id}`);
      mockRouter.query = {
        id: playbookDetailsFixture.id,
      };
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
  });

  describe('when the request to fetch from User details succeeds', () => {
    beforeEach(() => {
      mockRouter.setCurrentUrl(`/users/${entityIdFixture}/playbook/${playbookDetailsFixture.id}`);
      mockRouter.query = {
        id: entityIdFixture,
        playbook_id: playbookDetailsFixture.id,
      };
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
  });
});
