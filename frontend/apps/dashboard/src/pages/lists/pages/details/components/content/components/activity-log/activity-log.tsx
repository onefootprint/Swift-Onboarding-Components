import { getOrgListsByIdTimelineOptions, getOrgListsByListIdOptions } from '@onefootprint/axios/dashboard';
import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';
import Content from './components/content';
import Loading from './components/loading';
import SectionTitle from './components/section-title';

const ActivityLog = () => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.activity-log' });
  const router = useRouter();
  const id = router.query.id as string;
  const queries = useQueries({
    queries: [
      {
        ...getOrgListsByListIdOptions({ path: { listId: id } }),
        enabled: !!id,
      },
      {
        ...getOrgListsByIdTimelineOptions({ path: { id } }),
        enabled: !!id,
      },
    ],
  });

  const [detailsQuery, timelineQuery] = queries;
  const isPending = queries.some(query => query.isPending);
  const hasError = queries.some(query => query.error) && !isPending;
  const timelineData = timelineQuery.data?.data ?? [];
  const hasData = queries.every(query => query.data) && timelineData.length > 0;

  return isPending ? (
    <Loading />
  ) : (
    <div className="flex flex-col gap-3">
      <SectionTitle title={t('title', { alias: detailsQuery.data?.alias })} />
      {hasError ? <ErrorComponent error={timelineQuery.error || detailsQuery.error} /> : null}
      {hasData && <Content timeline={timelineData} />}
    </div>
  );
};

export default ActivityLog;
