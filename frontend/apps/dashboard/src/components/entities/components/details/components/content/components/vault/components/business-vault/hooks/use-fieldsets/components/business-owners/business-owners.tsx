import type { Entity } from '@onefootprint/types';
import { ErrorComponent } from 'src/components';

import useBusinessOwners from '@/entity/hooks/use-business-owners';
import Content from './components/content';
import Loading from './components/loading';

export type BusinessOwnersProps = {
  entity: Entity;
};

const BusinessOwners = ({ entity }: BusinessOwnersProps) => {
  const { isPending, error, data } = useBusinessOwners(entity.id);
  if (isPending) {
    return <Loading />;
  }
  if (error) {
    return <ErrorComponent error={error} />;
  }
  if (data) {
    return <Content businessOwners={data} />;
  }
  return null;
};

export default BusinessOwners;
