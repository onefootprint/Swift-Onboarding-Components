import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import ReviewStatus from '../../manual-review.types';
import ManualReviewDialog, {
  ManualReviewDialogProps,
} from './manual-review-dialog';

describe('<ManualReviewDialog />', () => {
  const defaultOptions = {
    open: true,
    onClose: jest.fn(),
    status: ReviewStatus.verified,
  };

  const renderManualReviewDialog = ({
    open = defaultOptions.open,
    onClose = defaultOptions.onClose,
    status = defaultOptions.status,
  }: Partial<ManualReviewDialogProps>) =>
    customRender(
      <ManualReviewDialog open={open} onClose={onClose} status={status} />,
    );

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
      renderManualReviewDialog({ status: ReviewStatus.verified });
      expect(
        screen.getByText('Why are you marking this user as Verified?'),
      ).toBeInTheDocument();

      renderManualReviewDialog({ status: ReviewStatus.notVerified });
      expect(
        screen.getByText('Why are you marking this user as Not verified?'),
      ).toBeInTheDocument();

      renderManualReviewDialog({ status: ReviewStatus.doNotOnboard });
      expect(
        screen.getByText('Why are you marking this user as Do not onboard?'),
      ).toBeInTheDocument();
    });

    it('should show error if no reason selected', async () => {
      renderManualReviewDialog({ status: ReviewStatus.verified });

      const completeButton = screen.getByRole('button', { name: 'Complete' });
      await userEvent.click(completeButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('A reason is needed');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
