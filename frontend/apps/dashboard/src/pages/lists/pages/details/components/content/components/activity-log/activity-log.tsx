import { Stack } from '@onefootprint/ui';
import { useRouter } from 'next/router';
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
  const { isPending: detailsLoading, error: detailsError, data: details } = useListDetails(id);
  const { isPending: timelineLoading, error: timelineError, data: timeline } = useListTimeline(id);
  const isPending = timelineLoading || detailsLoading;
  const error = timelineError || detailsError;

  return isPending ? (
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
