import { useTranslation } from '@onefootprint/hooks';
import { Filters as FPFilter } from '@onefootprint/ui';
import React from 'react';

import useOrgMembersFilters from '../../../../hooks/use-org-members-filters';
import useRolesOptions from '../../../../hooks/use-roles-options';

const Filters = () => {
  const { t } = useTranslation('pages.settings.members.filters');
  const filters = useOrgMembersFilters();
  const rolesQuery = useRolesOptions();

  return (
    <FPFilter
      controls={[
        {
          kind: 'multi-select',
          label: t('role.label'),
          loading: rolesQuery.isLoading,
          options: rolesQuery.data || [],
          query: 'member_role',
          selectedOptions: filters.values.role,
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
