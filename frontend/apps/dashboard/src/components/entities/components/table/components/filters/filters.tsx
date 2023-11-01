import { useTranslation } from '@onefootprint/hooks';
import { EntityStatus } from '@onefootprint/types';
import { Filters as FPFilter } from '@onefootprint/ui';
import React from 'react';

import useFilters from '../../../../hooks/use-filters';

export enum EntityWatchlistHitStatus {
  onWatchlist = 'true',
  notOnWatchlist = 'false',
}

export enum RequiresManualReviewStatus {
  requiresManualReview = 'true',
  doesNotRequireManualReview = 'false',
}

const Filters = () => {
  const { t } = useTranslation('pages.entities.filters');
  const filters = useFilters();

  return (
    <FPFilter
      controls={[
        {
          query: 'status',
          label: t('status.label'),
          kind: 'multi-select',
          options: [
            {
              value: EntityStatus.pass,
              label: t('status.options.verified'),
            },
            {
              value: EntityStatus.failed,
              label: t('status.options.failed'),
            },
            {
              value: EntityStatus.incomplete,
              label: t('status.options.incomplete'),
            },
            {
              value: EntityStatus.none,
              label: t('status.options.none'),
            },
          ],
          selectedOptions: filters.values.status,
        },
        {
          query: 'date_range',
          label: t('created.label'),
          kind: 'date',
          selectedOptions: filters.values.dateRange,
        },
        {
          query: 'watchlist_hit',
          label: t('on-watchlist.label'),
          kind: 'single-select',
          options: [
            {
              value: EntityWatchlistHitStatus.onWatchlist,
              label: t('on-watchlist.options.yes'),
            },
            {
              value: EntityWatchlistHitStatus.notOnWatchlist,
              label: t('on-watchlist.options.no'),
            },
          ],
          selectedOptions: filters.values.watchlist_hit,
        },
        {
          query: 'requires_manual_review',
          label: t('requires-manual-review.label'),
          kind: 'single-select',
          options: [
            {
              value: RequiresManualReviewStatus.requiresManualReview,
              label: t('requires-manual-review.options.yes'),
            },
            {
              value: RequiresManualReviewStatus.doesNotRequireManualReview,
              label: t('requires-manual-review.options.no'),
            },
          ],
          selectedOptions: filters.values.requires_manual_review,
        },
      ]}
      onChange={(queryKey, queryValue) => {
        filters.push({ [queryKey]: queryValue });
      }}
      onClear={filters.clear}
    />
  );
};

export default Filters;
