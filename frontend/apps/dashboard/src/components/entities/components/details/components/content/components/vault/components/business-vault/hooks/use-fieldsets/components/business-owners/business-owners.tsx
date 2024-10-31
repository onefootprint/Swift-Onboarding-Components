import useBusinessOwners from '@/entity/hooks/use-business-owners';
import type { Entity } from '@onefootprint/types';
import ErrorComponent from 'src/components/error';
import Content from './components/content';
import Loading from './components/loading';

export type BusinessOwnersProps = {
  entity: Entity;
};

const BusinessOwners = ({ entity }: BusinessOwnersProps) => {
  const { isPending, error, data } = useBusinessOwners(entity.id);
  const explanationMessage = entity.data.find(
    ({ identifier }) => identifier === 'business.beneficial_owner_explanation_message',
  )?.value as string | undefined;

  if (isPending) {
    return <Loading />;
  }
  if (error) {
    return <ErrorComponent error={error} />;
  }
  if (data) {
    return <Content businessOwners={data} explanationMessage={explanationMessage} />;
  }
  return null;
};

export default BusinessOwners;
