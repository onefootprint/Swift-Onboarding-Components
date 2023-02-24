import { useTranslation } from '@onefootprint/hooks';
import { UserStatus } from '@onefootprint/types';
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
              value: UserStatus.verified,
              label: t('status.options.verified'),
            },
            {
              value: UserStatus.failed,
              label: t('status.options.failed'),
            },
            {
              value: UserStatus.incomplete,
              label: t('status.options.incomplete'),
            },
            {
              value: UserStatus.vaultOnly,
              label: t('status.options.vault_only'),
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
