import { customRender, screen, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import ActivityLog from './activity-log';
import { withListDetails, withListTimeline, withListTimelineError } from './activity-log.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<ActivityLog />', () => {
  const renderActivityLog = () => customRender(<ActivityLog />);
  const listId = 'list_123';

  beforeEach(() => {
    mockRouter.setCurrentUrl(`/lists/${listId}`);
    mockRouter.query = {
      id: listId,
    };
  });

  describe('when fetching activity log is successful', () => {
    beforeEach(() => {
      withListTimeline(listId);
      withListDetails(listId);
    });

    it('should render the activity log', async () => {
      renderActivityLog();
      await waitFor(() => {
        const loading = screen.queryByLabelText('loading');
        expect(loading).not.toBeInTheDocument();
      });

      const title = screen.getByText('Activity log');
      expect(title).toBeInTheDocument();

      const date = screen.getByText('04/03/24');
      expect(date).toBeInTheDocument();

      const time = screen.getByText('08:56 PM');
      expect(time).toBeInTheDocument();

      const name = screen.getByText('Raquel Spinka');
      expect(name).toBeInTheDocument();

      const email = screen.getByText('(jon79@gmail.com)');
      expect(email).toBeInTheDocument();

      const action = screen.getByText('added');
      expect(action).toBeInTheDocument();

      const firstEntry = screen.getByText('test.com');
      expect(firstEntry).toBeInTheDocument();

      const secondEntry = screen.getByText('test2.com');
      expect(secondEntry).toBeInTheDocument();
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
        const loading = screen.queryByLabelText('loading');
        expect(loading).not.toBeInTheDocument();
      });
      const error = screen.getByText('Something went wrong');
      expect(error).toBeInTheDocument();
    });
  });
});
