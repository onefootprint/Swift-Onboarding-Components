import { Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useFilters, { EntityStatusFilter } from '../../../../hooks/use-filters';
import DrawerFilter from './components/drawer-filter';
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
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entities.filters',
  });
  const filters = useFilters();
  const manualReviewQuery = useManualReview();
  const isAll = !filters.values.state && !filters.values.verification;

  return (
    <>
      <Stack gap={3} flexWrap="wrap">
        <ToggleGroup
          options={[{ value: 'all', label: 'All' }]}
          groupId="all"
          value={isAll ? 'all' : undefined}
          onChange={() => {
            filters.push({ state: undefined, verification: undefined });
          }}
        />
        <ToggleGroup
          groupId="state"
          value={filters.values.state}
          options={[
            { value: EntityStatusFilter.complete, label: t('status.complete') },
            {
              value: EntityStatusFilter.incomplete,
              label: t('status.incomplete'),
            },
          ]}
          onChange={newValue => {
            const newVerification =
              newValue === EntityStatusFilter.incomplete
                ? undefined
                : filters.values.verification;

            filters.push({
              state: newValue,
              verification: newVerification,
            });
          }}
        />
        <ToggleGroup
          groupId="verification"
          value={filters.values.verification}
          disabled={filters.values.state === EntityStatusFilter.incomplete}
          options={[
            { value: EntityStatusFilter.pass, label: t('status.pass') },
            { value: EntityStatusFilter.failed, label: t('status.failed') },
            { value: EntityStatusFilter.none, label: t('status.none') },
            {
              value: EntityStatusFilter.manualReview,
              label: t('status.manual-review'),
              count: manualReviewQuery.data?.meta.count,
            },
          ]}
          onChange={newValue => {
            filters.push({
              verification: newValue,
              state: EntityStatusFilter.complete,
            });
          }}
        />
        {filters.isReady && <DrawerFilter />}
      </Stack>
      <Info />
    </>
  );
};

export default Filters;
