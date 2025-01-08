import { getOrgMembersOptions } from '@onefootprint/axios/dashboard';
import { useIntl } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { OrganizationMember } from '@onefootprint/request-types/dashboard';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';
import useMembersFilters from './use-members-filters';

const useMembers = () => {
  const { formatRelativeDate } = useIntl();
  const filters = useMembersFilters();
  const { requestParams } = filters;

  const membersQuery = useQuery({
    ...getOrgMembersOptions({ query: requestParams }),
    enabled: filters.isReady,
    select: response => ({
      meta: response.meta,
      data: response.data.map(member => formatMember(member, formatRelativeDate)),
    }),
  });

  const pagination = usePagination({
    count: membersQuery.data?.meta.count,
    next: membersQuery.data?.meta.nextPage,
    onChange: newPage => filters.push({ members_page: newPage.toString() }),
    page: filters.values.page,
    pageSize: 10,
  });

  const errorMessage = membersQuery.error ? getErrorMessage(membersQuery.error) : undefined;

  return {
    ...membersQuery,
    errorMessage,
    pagination,
  };
};

const formatMember = (member: OrganizationMember, formatRelativeDate: (date: Date) => string) => ({
  ...member,
  rolebinding: {
    lastLoginAt: member.rolebinding?.lastLoginAt
      ? formatRelativeDate(new Date(member.rolebinding.lastLoginAt))
      : undefined,
  },
});

export default useMembers;
