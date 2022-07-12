import { useTranslation } from 'hooks';
import React from 'react';
import styled from 'styled-components';
import { LinkButton, LoadingIndicator } from 'ui';

import AccessLogsTimeline from './components/access-logs-timeline';
import useGetAccessLogs from './hooks/use-get-access-events/use-get-access-events';
import { AccessLog } from './types';

const AccessLogs = () => {
  const { t } = useTranslation('pages.my-footprint-identity.access-logs');
  // TODO: pass auth token
  // https://linear.app/footprint/issue/FP-589/add-auth-token-to-access-logs-fetching-in-my1fp
  const getAccessLogsQuery = useGetAccessLogs('');
  const accessLogs =
    (getAccessLogsQuery.data?.pages || []).reduce(
      (allPages, page) => [...allPages, ...page.data],
      [] as AccessLog[],
    ) || [];

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
  align-items: center;
  flex-direction: column;
`;

export default AccessLogs;
