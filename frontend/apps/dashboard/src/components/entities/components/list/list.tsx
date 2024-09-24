import type { Entity } from '@onefootprint/types';
import { EntityKind } from '@onefootprint/types';
import { Pagination, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import type React from 'react';
import useSession from 'src/hooks/use-session';

import useFilters from '../../hooks/use-filters';
import IntroDialog from './components/intro-dialog';
import useEntities from './hooks/use-entities';
import Provider from './hooks/use-entities-context';

export type ListProps = {
  children: React.ReactNode;
  kind: EntityKind;
  title: string;
  subtitle?: string;
  basePath: string;
  defaultFilters?: Record<string, unknown>;
};

const List = ({ children, title, subtitle, kind, basePath, defaultFilters }: ListProps) => {
  const router = useRouter();
  const filters = useFilters();
  const session = useSession();
  const { data: response, isPending, errorMessage, pagination } = useEntities(kind, defaultFilters);

  const handleRowClick = (entity: Entity) => {
    const mode = session.isLive ? 'live' : 'sandbox';
    router.push({
      pathname: `/${basePath}/${entity.id}`,
      query: { ...filters.query, mode },
    });
  };

  const handleSearchChange = (search: string) => {
    filters.push({ search, cursor: undefined });
  };

  return (
    <Provider
      kind={kind}
      data={response?.data}
      errorMessage={errorMessage}
      initialSearch={filters.query.search}
      isPending={isPending}
      onRowClick={handleRowClick}
      onSearchChange={handleSearchChange}
    >
      <Text variant="heading-2" marginBottom={subtitle ? 2 : 5}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="body-2" color="secondary" marginBottom={7}>
          {subtitle}
        </Text>
      )}
      {children}
      {response && response.meta.count > 0 && (
        <Pagination
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onNextPage={pagination.loadNextPage}
          onPrevPage={pagination.loadPrevPage}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalNumResults={response.meta.count}
        />
      )}
      {kind === EntityKind.person ? <IntroDialog /> : null}
    </Provider>
  );
};

export default List;
