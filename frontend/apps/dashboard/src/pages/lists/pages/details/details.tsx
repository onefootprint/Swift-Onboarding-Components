import { Box } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { ErrorComponent } from 'src/components';

import Content from './components/content';
import Loading from './components/loading';
import useListDetails from './hooks/use-list-details';
import useListEntries from './hooks/use-list-entries';

const Details = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading: listLoading, error: listError, data: list } = useListDetails(id);
  const { isLoading: entriesLoading, error: entriesError, data: entries } = useListEntries(id);

  const isLoading = listLoading || entriesLoading;
  const hasError = (listError || entriesError) && !listLoading && !entriesLoading;
  const hasData = !hasError && list && entries && !listLoading && !entriesLoading;

  return (
    <Box aria-busy={entriesLoading}>
      {isLoading && <Loading />}
      {hasError ? <ErrorComponent error={entriesError} /> : null}
      {hasData && <Content />}
    </Box>
  );
};

export default Details;
