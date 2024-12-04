import { getOrgListsByListIdEntriesOptions, getOrgListsByListIdOptions } from '@onefootprint/axios/dashboard';
import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { ErrorComponent } from 'src/components';
import Content from './components/content';
import Loading from './components/loading';

const Details = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const queries = useQueries({
    queries: [
      {
        ...getOrgListsByListIdOptions({ path: { listId: id } }),
        enabled: !!id,
      },
      {
        ...getOrgListsByListIdEntriesOptions({ path: { listId: id } }),
        enabled: !!id,
      },
    ],
  });

  const [_listQuery, entriesQuery] = queries;
  const isPending = queries.some(query => query.isPending);
  const hasError = queries.some(query => query.error) && !isPending;
  const hasData = !hasError && queries.every(query => query.data) && !isPending;

  return (
    <div aria-busy={entriesQuery.isPending}>
      {isPending && <Loading />}
      {hasError ? <ErrorComponent error={entriesQuery.error} /> : null}
      {hasData ? <Content /> : null}
    </div>
  );
};

export default Details;
