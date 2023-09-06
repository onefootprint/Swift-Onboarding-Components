import type { EntityKind } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';
import { Error } from 'src/components';

import Content from './components/content';
import Loading from './components/loading';
import Provider from './hooks/use-entity-context';
import useEntityInitialData from './hooks/use-entity-initial-data';

export type DetailsProps = {
  kind: EntityKind;
  listPath: string;
};

const Details = ({ kind, listPath }: DetailsProps) => {
  const { isLoading, error, data } = useEntityInitialData();

  return (
    <Box aria-busy={isLoading}>
      <Provider kind={kind} listPath={listPath}>
        <>
          {isLoading && <Loading />}
          {error && !isLoading && <Error error={error} />}
          {data && !isLoading && <Content />}
        </>
      </Provider>
    </Box>
  );
};

export default Details;
