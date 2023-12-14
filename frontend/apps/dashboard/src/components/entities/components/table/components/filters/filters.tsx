import { useTranslation } from '@onefootprint/hooks';
import { EntityStatus } from '@onefootprint/types';
import type { FilterControl } from '@onefootprint/ui';
import { Filters as FPFilter, Stack } from '@onefootprint/ui';
import React from 'react';
import useSession from 'src/hooks/use-session';

import useFilters from '../../../../hooks/use-filters';
import Info from './components/info';
import ToggleGroup from './components/toggle-group';
import useManualReview from './hooks/use-manual-review';

export enum EntityWatchlistHitStatus {
  onWatchlist = 'true',
  notOnWatchlist = 'false',
}

export enum EntityHasOutstandingWorkflowRequestStatus {
  yes = 'true',
  no = 'false',
}

export enum ShowUnverifiedStatus {
  yes = 'true',
  no = 'false',
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
  const {
    data: { user },
  } = useSession();

  const filterControls: FilterControl[] = [
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
      query: 'has_outstanding_workflow_request',
      label: t('has-outstanding-workflow-request.label'),
      kind: 'single-select',
      options: [
        {
          value: EntityHasOutstandingWorkflowRequestStatus.yes,
          label: t('has-outstanding-workflow-request.options.yes'),
        },
        {
          value: EntityHasOutstandingWorkflowRequestStatus.no,
          label: t('has-outstanding-workflow-request.options.no'),
        },
      ],
      selectedOptions: filters.values.has_outstanding_workflow_request,
    },
    {
      query: 'date_range',
      label: t('created.label'),
      kind: 'date',
      selectedOptions: filters.values.dateRange,
    },
  ];

  if (user?.isFirmEmployee) {
    filterControls.push({
      query: 'show_unverified',
      label: t('show-unverified.label'),
      kind: 'single-select',
      options: [
        {
          value: ShowUnverifiedStatus.yes,
          label: t('show-unverified.options.yes'),
        },
        {
          value: ShowUnverifiedStatus.no,
          label: t('show-unverified.options.no'),
        },
      ],
      selectedOptions: filters.values.show_unverified,
    });
  }

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
          controls={filterControls}
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
