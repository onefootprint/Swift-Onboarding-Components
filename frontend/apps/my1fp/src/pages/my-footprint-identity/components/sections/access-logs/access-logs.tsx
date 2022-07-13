import { useTranslation } from 'hooks';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';
import { LinkButton, LoadingIndicator } from 'ui';

import AccessLogsTimeline from './components/access-logs-timeline';
import useGetAccessLogs from './hooks/use-get-access-logs';
import { AccessLog } from './types';

const AccessLogs = () => {
  const { t } = useTranslation('pages.my-footprint-identity.access-logs');
  const { data } = useSessionUser();

  const getAccessLogsQuery = useGetAccessLogs(data?.authToken);
  if (!data) {
    return null;
  }

  const accessLogs = (getAccessLogsQuery.data?.pages || []).reduce(
    (allPages, page) => [...allPages, ...page.data],
    [] as AccessLog[],
  );
  const isLoading =
    getAccessLogsQuery.isLoading || getAccessLogsQuery.isFetchingNextPage;
  const shouldShowLoadMoreButton = !isLoading && getAccessLogsQuery.hasNextPage;

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
      {shouldShowLoadMoreButton && (
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
