import { useTranslation } from 'hooks';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';
import { LinkButton, LoadingIndicator, Typography } from 'ui';

import AccessLogsTimeline from './components/access-logs-timeline';
import useGetAccessLogs from './hooks/use-get-access-logs';
import { AccessLog } from './types';

const AccessLogs = () => {
  const { t } = useTranslation('pages.my-footprint-identity.access-logs');
  const { session } = useSessionUser();

  const getAccessLogsQuery = useGetAccessLogs(session?.authToken);
  if (!session) {
    return null;
  }

  const accessLogs = (getAccessLogsQuery.data?.pages || []).reduce(
    (allPages, page) => [...allPages, ...page],
    [] as AccessLog[],
  );
  const isLoading =
    getAccessLogsQuery.isLoading || getAccessLogsQuery.isFetchingNextPage;
  const shouldShowLoadMoreButton = !isLoading && getAccessLogsQuery.hasNextPage;
  const shouldShowEmptyText =
    !isLoading && !getAccessLogsQuery.hasNextPage && accessLogs.length === 0;

  const handleLoadMore = () => {
    if (
      !getAccessLogsQuery.isFetchingNextPage &&
      getAccessLogsQuery.hasNextPage
    ) {
      getAccessLogsQuery.fetchNextPage();
    }
  };

  return (
    <Container>
      <AccessLogsTimeline accessLogs={accessLogs} />
      {isLoading && <LoadingIndicator />}
      {shouldShowEmptyText && (
        <Typography variant="body-3">{t('empty')}</Typography>
      )}
      {!isLoading && shouldShowLoadMoreButton && (
        <LinkButton onClick={handleLoadMore}>{t('timeline.cta')}</LinkButton>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

export default AccessLogs;
