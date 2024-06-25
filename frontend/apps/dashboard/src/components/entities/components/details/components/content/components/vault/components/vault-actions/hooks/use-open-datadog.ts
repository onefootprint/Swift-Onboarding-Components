import useEntityAuthEvents from 'src/components/entities/components/details/hooks/use-entity-auth-events';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';

export const useOpenDatadog = () => {
  const entityId = useEntityId();
  // Each time the user logs into bifrost, the backend stores the session ID used. We can aggregate all of
  // these session IDs to quickly get the set of session IDs used by an fp_id.
  // Note, this won't show sessions created via implicit auth, but this is only an experimental feature.
  // In the future, we can migrate this to a different source that even handles implicit auth.
  const { data, isLoading, isError } = useEntityAuthEvents(entityId);
  const sessionIds = [...new Set(data?.map(e => e.insight.sessionId).filter(sessionId => !!sessionId))];

  const openDatadog = () => {
    const sessionIdsStr = sessionIds?.join(' OR ');
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const url = `https://app.datadoghq.com/logs?query=@fp_session_id:(${sessionIdsStr})&from_ts=${thirtyDaysAgo}`;
    window.open(url);
  };

  return {
    isEnabled: !isLoading && !isError && !!sessionIds?.length,
    openDatadog,
  };
};
