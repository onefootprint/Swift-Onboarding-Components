import { Box } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { Error } from 'src/components';

import Content from './components/content';
import Loading from './components/loading';
import useList from './hooks/use-list';
import useListEntries from './hooks/use-list-entries';

const Details = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading: listLoading, error: listError, data: list } = useList(id);
  const {
    isLoading: entriesLoading,
    error: entriesError,
    data: entries,
  } = useListEntries(id);

  const isLoading = listLoading || entriesLoading;
  const hasError =
    (listError || entriesError) && !listLoading && !entriesLoading;
  const hasData =
    !hasError && list && entries && !listLoading && !entriesLoading;

  return (
    <Box aria-busy={entriesLoading}>
      {isLoading && <Loading />}
      {hasError ? <Error error={entriesError} /> : null}
      {hasData && <Content />}
    </Box>
  );
};

export default Details;
