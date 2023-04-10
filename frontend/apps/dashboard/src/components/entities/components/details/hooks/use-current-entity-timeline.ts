import useEntityId from './use-entity-id';
import useEntityTimeline from './use-entity-timeline';

const useCurrentEntityTimeline = () => {
  const id = useEntityId();
  return useEntityTimeline(id);
};

export default useCurrentEntityTimeline;
