import type { Entity } from '@onefootprint/types';
import React from 'react';
import { ErrorComponent } from 'src/components';

import Content from './components/content';
import Loading from './components/loading';
import useBusinessOwners from './hooks/use-business-owners.ts';

export type BusinessOwnersProps = {
  entity: Entity;
};

const BusinessOwners = ({ entity }: BusinessOwnersProps) => {
  const { isLoading, error, data } = useBusinessOwners(entity.id);
  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <ErrorComponent error={error} />;
  }
  if (data) {
    return <Content businessOwners={data} entity={entity} />;
  }
  return null;
};

export default BusinessOwners;
