import { useTranslation } from '@onefootprint/hooks';
import { Filters as FPFilter } from '@onefootprint/ui';
import useFilters from 'dashboard/src/components/entities/hooks/use-filters';
import React from 'react';

const ManualReviewFilters = () => {
  const { t } = useTranslation('pages.entities.filters');
  const filters = useFilters();

  return (
    <FPFilter
      controls={[
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

export default ManualReviewFilters;
