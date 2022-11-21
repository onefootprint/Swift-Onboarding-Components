import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { OnboardingStatus, ReviewStatus } from '@onefootprint/types';
import React from 'react';

import ManualReviewDialog, {
  ManualReviewDialogProps,
} from './manual-review-dialog';

describe('<ManualReviewDialog />', () => {
  const defaultOptions = {
    open: true,
    onClose: jest.fn(),
    status: ReviewStatus.pass,
    user: {
      id: 'user_id',
      isPortable: true,
      identityDataAttributes: [],
      startTimestamp: '15:21:53 GMT-0500',
      orderingId: 'id',
      requiresManualReview: true,
      status: OnboardingStatus.failed,
      vaultData: {
        kycData: {},
      },
    },
  };

  const renderManualReviewDialog = ({
    open = defaultOptions.open,
    onClose = defaultOptions.onClose,
    status = defaultOptions.status,
    user = defaultOptions.user,
  }: Partial<ManualReviewDialogProps>) =>
    customRender(
      <ManualReviewDialog
        user={user}
        open={open}
        onClose={onClose}
        status={status}
      />,
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
      renderManualReviewDialog({ status: ReviewStatus.pass });
      expect(
        screen.getByText('Why are you marking this user as Verified?'),
      ).toBeInTheDocument();

      renderManualReviewDialog({ status: ReviewStatus.fail });
      expect(
        screen.getByText('Why are you marking this user as Not verified?'),
      ).toBeInTheDocument();
    });

    it('should show error if no reason selected', async () => {
      renderManualReviewDialog({ status: ReviewStatus.pass });

      const completeButton = screen.getByRole('button', { name: 'Complete' });
      await userEvent.click(completeButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('A reason is needed');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
