import { useTranslation } from '@onefootprint/hooks';
import { OnboardingStatus } from '@onefootprint/types';
import { Filters as FPFilter } from '@onefootprint/ui';
import React from 'react';

import useUsersFilters from '../../../../hooks/use-users-filters';

const Filters = () => {
  const { t } = useTranslation('pages.users.filters');
  const filters = useUsersFilters();

  return (
    <FPFilter
      controls={[
        {
          query: 'status',
          label: t('status.label'),
          kind: 'multi-select',
          options: [
            {
              value: OnboardingStatus.verified,
              label: t('status.options.verified'),
            },
            {
              value: OnboardingStatus.failed,
              label: t('status.options.failed'),
            },
          ],
          selectedOptions: filters.values.status,
        },
        {
          query: 'date_range',
          label: t('date-range.label'),
          kind: 'date',
          selectedOptions: filters.values.dateRange,
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
