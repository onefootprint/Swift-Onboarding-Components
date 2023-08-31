import useEntityAuthEvents from './use-entity-auth-events';
import useEntityId from './use-entity-id';

const useCurrentEntityAuthEvents = () => {
  const id = useEntityId();
  return useEntityAuthEvents(id);
};

export default useCurrentEntityAuthEvents;
