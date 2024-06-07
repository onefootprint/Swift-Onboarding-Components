import { Stack } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';

import useListDetails from '../../../../hooks/use-list-details';
import SectionTitle from '../section-title';
import Content from './components/content';
import Loading from './components/loading';
import useListTimeline from './hooks/use-list-timeline';

const ActivityLog = () => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log',
  });
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading: detailsLoading, error: detailsError, data: details } = useListDetails(id);
  const { isLoading: timelineLoading, error: timelineError, data: timeline } = useListTimeline(id);
  const isLoading = timelineLoading || detailsLoading;
  const error = timelineError || detailsError;

  return isLoading ? (
    <Loading />
  ) : (
    <Stack gap={4} direction="column">
      <SectionTitle title={t('title', { alias: details?.alias })} />
      {error ? <ErrorComponent error={error} /> : null}
      {timeline && <Content timeline={timeline?.data} />}
    </Stack>
  );
};

export default ActivityLog;
