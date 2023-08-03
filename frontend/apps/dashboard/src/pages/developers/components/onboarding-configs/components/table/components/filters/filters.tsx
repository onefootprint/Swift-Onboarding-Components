import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfigStatus } from '@onefootprint/types';
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
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.table.filters',
  );
  const filters = useFilters();

  return (
    <FPFilter
      controls={[
        {
          query: 'onboarding_configs_status',
          label: t('status.label'),
          kind: 'single-select',
          options: [
            {
              value: OnboardingConfigStatus.enabled,
              label: t('status.enabled'),
            },
            {
              value: OnboardingConfigStatus.disabled,
              label: t('status.disabled'),
            },
          ],
          selectedOptions: filters.values.status,
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
