import { getEntitiesByFpIdBusinessOwnersOptions } from '@onefootprint/axios/dashboard';
import type { Entity } from '@onefootprint/request-types/dashboard';
import { useQuery } from '@tanstack/react-query';
import ErrorComponent from 'src/components/error';
import Content from './components/content';
import Loading from './components/loading';

export type BusinessOwnersProps = {
  entity: Entity;
};

const BusinessOwners = ({ entity }: BusinessOwnersProps) => {
  const { isPending, error, data } = useQuery(
    getEntitiesByFpIdBusinessOwnersOptions({
      path: { fpId: entity.id },
    }),
  );
  const explanationMessage = entity.data
    //@ts-expect-error fix
    .find(item => item.identifier === 'business.beneficial_owner_explanation_message')
    ?.value?.toString();

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
