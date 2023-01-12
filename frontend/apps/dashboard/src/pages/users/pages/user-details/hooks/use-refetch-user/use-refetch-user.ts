import useUser from '../use-user';
import useUserAnnotations from '../use-user-annotations';
import useUserTimeline from '../use-user-timeline';

const useRefetchUser = (userId: string) => {
  const userQuery = useUser(userId);
  const userTimelineQuery = useUserTimeline(userId);
  const userAnnotationsQuery = useUserAnnotations(userId);

  return () => {
    userQuery.refetch();
    userTimelineQuery.refetch();
    userAnnotationsQuery.refetch();
  };
};

export default useRefetchUser;
