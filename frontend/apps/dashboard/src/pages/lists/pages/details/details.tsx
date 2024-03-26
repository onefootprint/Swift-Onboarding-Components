import { Box } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { Error } from 'src/components';

import Content from './components/content';
import Loading from './components/loading';
import useListDetails from './hooks/use-list-details';

const Details = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, error, data } = useListDetails(id);

  return (
    <Box aria-busy={isLoading}>
      {isLoading && <Loading />}
      {error && !isLoading ? <Error error={error} /> : null}
      {data && !isLoading && <Content />}
    </Box>
  );
};

export default Details;
