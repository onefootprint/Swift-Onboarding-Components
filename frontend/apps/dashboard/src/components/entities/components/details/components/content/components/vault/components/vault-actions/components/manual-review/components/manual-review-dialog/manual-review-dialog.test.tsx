import { createUseRouterSpy, customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { OrgFrequentNoteKind, ReviewStatus } from '@onefootprint/types';
import { withFrequentNotes } from 'src/components/frequent-notes-text-area/frequent-notes-text-area.test.config';

import type { ManualReviewDialogProps } from './manual-review-dialog';
import ManualReviewDialog from './manual-review-dialog';

const useRouterSpy = createUseRouterSpy();

describe('<ManualReviewDialog />', () => {
  beforeEach(() => {
    withFrequentNotes(OrgFrequentNoteKind.ManualReview, []);
    useRouterSpy({
      pathname: '/users/detail',
      query: {
        footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
      },
    });
  });

  const defaultOptions = {
    open: true,
    onClose: jest.fn(),
    status: ReviewStatus.pass,
  };

  const renderManualReviewDialog = ({
    open = defaultOptions.open,
    onClose = defaultOptions.onClose,
    status = defaultOptions.status,
  }: Partial<ManualReviewDialogProps>) =>
    customRender(<ManualReviewDialog open={open} onClose={onClose} status={status} />);

  describe('when clicking on the cancel button', () => {
    it('should call close callback', async () => {
      const onCloseMockFn = jest.fn();
      renderManualReviewDialog({ onClose: onCloseMockFn });

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(cancelButton);

      expect(onCloseMockFn).toHaveBeenCalled();
    });
  });

  describe('when completing', () => {
    it('should show correct status in prompt', () => {
      renderManualReviewDialog({ status: ReviewStatus.pass });
      expect(screen.getByText('Why are you marking this user as Pass?')).toBeInTheDocument();

      renderManualReviewDialog({ status: ReviewStatus.fail });
      expect(screen.getByText('Why are you marking this user as Fail?')).toBeInTheDocument();
    });

    it('should show error if no note input', async () => {
      renderManualReviewDialog({ status: ReviewStatus.pass });

      const completeButton = screen.getByRole('button', { name: 'Complete' });
      await userEvent.click(completeButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('A note is required');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
