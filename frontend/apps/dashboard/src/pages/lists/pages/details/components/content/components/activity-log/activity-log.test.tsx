import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import ActivityLog from './activity-log';
import {
  withListDetails,
  withListTimeline,
  withListTimelineError,
} from './activity-log.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<ActivityLog />', () => {
  const renderActivityLog = () => customRender(<ActivityLog />);
  const listId = 'list_123';

  beforeEach(() => {
    useRouterSpy({
      pathname: `/lists/${listId}`,
      query: { id: listId },
    });
  });

  describe('when fetching activity log is successful', () => {
    beforeEach(() => {
      withListTimeline(listId);
      withListDetails(listId);
    });

    it('should render the activity log', async () => {
      renderActivityLog();

      await waitFor(() => {
        expect(screen.getByText('Activity log')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('04/03/24')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('8:56 PM')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText('Belce Dogru (belce@onefootprint.com)'),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('added')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('test.com')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('test2.com')).toBeInTheDocument();
      });
    });
  });

  describe('when fetching activity log fails', () => {
    beforeEach(() => {
      withListTimelineError(listId);
      withListDetails(listId);
    });

    it('should render the error message', async () => {
      renderActivityLog();

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });
});
