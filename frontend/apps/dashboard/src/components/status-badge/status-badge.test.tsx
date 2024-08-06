import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { EntityStatus } from '@onefootprint/types';

import type { StatusBadgeProps } from './status-badge';
import StatusBadge from './status-badge';

const renderStatusBadge = ({
  status,
  requiresManualReview = false,
  shouldShowWatchlistLabel,
  isOnWatchlist,
  watchlistLabel,
}: StatusBadgeProps) =>
  customRender(
    <StatusBadge
      status={status}
      requiresManualReview={requiresManualReview}
      shouldShowWatchlistLabel={shouldShowWatchlistLabel}
      isOnWatchlist={isOnWatchlist}
      watchlistLabel={watchlistLabel}
    />,
  );

describe('<StatusBadge />', () => {
  it('Should show the correct status', () => {
    renderStatusBadge({
      status: EntityStatus.failed,
      requiresManualReview: false,
      shouldShowWatchlistLabel: false,
      isOnWatchlist: true,
      watchlistLabel: 'This user is on a watchlist',
    });

    const statusText = screen.getByText('Fail');
    expect(statusText).toBeInTheDocument();
  });

  it('Should not show the watchlist label when the show flag is not set', () => {
    renderStatusBadge({
      status: EntityStatus.failed,
      requiresManualReview: false,
      shouldShowWatchlistLabel: false,
      isOnWatchlist: true,
      watchlistLabel: 'This user is on a watchlist',
    });

    const watchlistLabel = screen.queryAllByText('This user is on a watchlist');
    expect(watchlistLabel).toHaveLength(0);
  });

  it('Should show the watchlist label when the show flag is set', () => {
    renderStatusBadge({
      status: EntityStatus.failed,
      requiresManualReview: false,
      shouldShowWatchlistLabel: true,
      isOnWatchlist: true,
      watchlistLabel: 'This user is on a watchlist',
    });

    const watchlistLabel = screen.getByText('This user is on a watchlist');
    expect(watchlistLabel).toBeInTheDocument();
  });

  it('Should not show the watchlist icon or label when the user is not on watchlist', () => {
    renderStatusBadge({
      status: EntityStatus.failed,
      requiresManualReview: false,
      shouldShowWatchlistLabel: true,
      isOnWatchlist: false,
      watchlistLabel: 'This user is on a watchlist',
    });

    const watchlistLabel = screen.queryAllByText('This user is on watchlist');
    expect(watchlistLabel).toHaveLength(0);
    const watchlistFailIcon = screen.queryAllByTestId('watchlistFailIcon');
    expect(watchlistFailIcon).toHaveLength(0);
  });

  it('Should show the watchlist icon when the user is on watchlist', () => {
    renderStatusBadge({
      status: EntityStatus.failed,
      requiresManualReview: false,
      shouldShowWatchlistLabel: true,
      isOnWatchlist: true,
      watchlistLabel: 'This user is on a watchlist',
    });

    const watchlistFailIcon = screen.getByTestId('watchlistFailIcon');
    expect(watchlistFailIcon).toBeInTheDocument();
  });

  it('Should render correct tooltip text when the watchlist label is not shown', async () => {
    renderStatusBadge({
      status: EntityStatus.failed,
      requiresManualReview: false,
      shouldShowWatchlistLabel: false,
      isOnWatchlist: true,
      watchlistLabel: 'This user is on a watchlist',
    });

    const watchlistFailIcon = screen.getByTestId('watchlistFailIcon');
    await userEvent.hover(watchlistFailIcon);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', {
        name: 'This user is on a watchlist',
      });
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('Should not render tooltip text when the watchlist label is shown', async () => {
    renderStatusBadge({
      status: EntityStatus.failed,
      requiresManualReview: false,
      shouldShowWatchlistLabel: true,
      isOnWatchlist: true,
      watchlistLabel: 'This user is on a watchlist',
    });

    const watchlistFailIcon = screen.getByTestId('watchlistFailIcon');
    await userEvent.hover(watchlistFailIcon);

    await waitFor(() => {
      const tooltips = screen.queryAllByRole('tooltip');
      expect(tooltips).toHaveLength(0);
    });
  });

  it('Should show manual review icon when the user requires manual review', async () => {
    renderStatusBadge({
      status: EntityStatus.failed,
      requiresManualReview: true,
      shouldShowWatchlistLabel: true,
      isOnWatchlist: true,
      watchlistLabel: 'This user is on a watchlist',
    });

    const manualReviewIconIcon = screen.getByTestId('manualReviewIcon');
    expect(manualReviewIconIcon).toBeInTheDocument();
  });

  it('Should show manual review icon when the user does not require a manual review', async () => {
    renderStatusBadge({
      status: EntityStatus.failed,
      requiresManualReview: false,
      shouldShowWatchlistLabel: true,
      isOnWatchlist: true,
      watchlistLabel: 'This user is on a watchlist',
    });

    const manualReviewIconIcon = screen.queryAllByTestId('manualReviewIcon');
    expect(manualReviewIconIcon).toHaveLength(0);
  });
});
