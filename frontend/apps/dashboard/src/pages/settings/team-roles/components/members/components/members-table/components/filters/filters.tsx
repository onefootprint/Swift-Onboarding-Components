import { RoleKind } from '@onefootprint/types';
import { Filters as FPFilter } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useRoles from 'src/hooks/use-roles';

import useMembersFilters from '../../../../hooks/use-members-filters';

const Filters = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.members.filters',
  });
  const filters = useMembersFilters();
  const rolesQuery = useRoles(RoleKind.dashboardUser);

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
        filters.push({ [queryKey]: queryValue, members_page: undefined });
      }}
      onClear={filters.clear}
    />
  );
};

export default Filters;
