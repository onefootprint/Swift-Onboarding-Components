import { useTranslation } from '@onefootprint/hooks';
import { EntityStatus } from '@onefootprint/types';
import { Filters as FPFilter, Stack } from '@onefootprint/ui';
import React from 'react';

import useFilters from '../../../../hooks/use-filters';
import Info from './components/info';
import ToggleGroup from './components/toggle-group';
import useManualReview from './hooks/use-manual-review';

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
  const manualReviewQuery = useManualReview();
  const isAll = !filters.values.state && !filters.values.verification;

  return (
    <>
      <Stack gap={3} flexWrap="wrap">
        <ToggleGroup
          options={[{ value: 'all', label: 'All' }]}
          value={isAll ? 'all' : undefined}
          onChange={() => {
            filters.push({ state: undefined, verification: undefined });
          }}
        />
        <ToggleGroup
          value={filters.values.state}
          options={[
            { value: EntityStatus.complete, label: t('status.complete') },
            { value: EntityStatus.incomplete, label: t('status.incomplete') },
          ]}
          onChange={newValue => {
            const newVerification =
              newValue === EntityStatus.incomplete
                ? undefined
                : filters.values.verification;

            filters.push({
              state: newValue,
              verification: newVerification,
            });
          }}
        />
        <ToggleGroup
          value={filters.values.verification}
          disabled={filters.values.state === EntityStatus.incomplete}
          options={[
            { value: EntityStatus.pass, label: t('status.pass') },
            { value: EntityStatus.failed, label: t('status.failed') },
            { value: EntityStatus.none, label: t('status.none') },
            {
              value: EntityStatus.manualReview,
              label: t('status.manual-review'),
              count: manualReviewQuery.data?.meta.count,
            },
          ]}
          onChange={newValue => {
            filters.push({
              verification: newValue,
              state: EntityStatus.complete,
            });
          }}
        />
        <FPFilter
          controls={[
            {
              query: 'watchlist_hit',
              label: t('on-watchlist.label'),
              kind: 'single-select',
              disabled: filters.values.state === EntityStatus.incomplete,
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
              query: 'date_range',
              label: t('created.label'),
              kind: 'date',
              selectedOptions: filters.values.dateRange,
            },
          ]}
          onChange={(queryKey, queryValue) => {
            filters.push({ [queryKey]: queryValue });
          }}
          onClear={filters.clear}
        />
      </Stack>
      <Info />
    </>
  );
};

export default Filters;
