import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Details from './details';
import {
  playbookDetailsFixture,
  withPlaybookDetails,
  withPlaybookDetailsError,
} from './details.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Details />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/developers',
      query: {
        tab: 'onboarding-configs',
        onboarding_config_id: playbookDetailsFixture.id,
      },
    });
  });

  const renderDetails = () => {
    customRender(<Details />);
  };

  const renderDetailsAndWaitData = async () => {
    renderDetails();

    await waitFor(() => {
      const content = screen.getByText('Playbook basics');
      expect(content).toBeInTheDocument();
    });
  };

  describe('when the request to fetch the onboarding config details fails', () => {
    beforeEach(() => {
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

  describe('when the request to fetch the playbook details succeeds', () => {
    beforeEach(() => {
      withPlaybookDetails(playbookDetailsFixture.id);
    });

    it('should show the playbook name', async () => {
      await renderDetailsAndWaitData();
      expect(
        screen.getAllByText(playbookDetailsFixture.name).length,
      ).toBeGreaterThanOrEqual(1);
    });
  });
});
