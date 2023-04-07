import { Entity, EntityKind } from '@onefootprint/types';
import { Pagination, Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';

import useFilters from '../../hooks/use-filters';
import useEntities from './hooks/use-entities';
import Provider from './hooks/use-entities-context';

export type ListProps = {
  children: React.ReactNode;
  kind: EntityKind;
  title: string;
  basePath: string;
};

const List = ({ children, title, kind, basePath }: ListProps) => {
  const router = useRouter();
  const filters = useFilters();
  const {
    data: response,
    isLoading,
    errorMessage,
    pagination,
  } = useEntities(kind);

  const handleRowClick = (entity: Entity) => {
    router.push({
      pathname: `/${basePath}/${entity.id}`,
      query: filters.query,
    });
  };

  const handleSearchChange = (search: string) => {
    filters.push({ search });
  };

  return (
    <Provider
      data={response?.data}
      errorMessage={errorMessage}
      initialSearch={filters.query.search}
      isLoading={isLoading}
      onRowClick={handleRowClick}
      onSearchChange={handleSearchChange}
    >
      <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
        {title}
      </Typography>
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
    </Provider>
  );
};

export default List;
