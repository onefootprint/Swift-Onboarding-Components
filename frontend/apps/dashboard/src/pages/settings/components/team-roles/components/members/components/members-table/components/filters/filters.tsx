import { useTranslation } from '@onefootprint/hooks';
import { Filters as FPFilter } from '@onefootprint/ui';
import React from 'react';

import useOrgMembersFilters from '../../../../hooks/use-org-members-filters';
import useRoles from '../../../../hooks/use-roles';

const Filters = () => {
  const { t } = useTranslation('pages.settings.members.filters');
  const filters = useOrgMembersFilters();
  const rolesQuery = useRoles();

  return (
    <FPFilter
      controls={[
        {
          kind: 'multi-select',
          label: t('role.label'),
          loading: rolesQuery.isLoading,
          options: rolesQuery.options,
          query: 'members_role',
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
