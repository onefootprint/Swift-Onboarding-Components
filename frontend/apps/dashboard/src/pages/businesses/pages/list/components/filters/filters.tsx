import { useTranslation } from '@onefootprint/hooks';
import { EntityStatus } from '@onefootprint/types';
import { Filters as FPFilter } from '@onefootprint/ui';
import React from 'react';

import useFilters from '../../hooks/use-filters';

const Filters = () => {
  const { t } = useTranslation('pages.businesses.filters');
  const filters = useFilters();

  return (
    <FPFilter
      controls={[
        {
          query: 'businesses_status',
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
          ],
          selectedOptions: filters.values.status,
        },
        {
          query: 'businesses_date_range',
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
