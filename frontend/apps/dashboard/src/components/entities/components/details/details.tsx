import { EntityKind } from '@onefootprint/types';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import Provider from './hooks/use-entity-context';
import useEntityInitialData from './hooks/use-entity-initial-data';

export type DetailsProps = {
  kind: EntityKind;
  listPath: string;
};

const Details = ({ kind, listPath }: DetailsProps) => {
  const { isLoading, errorMessage, data } = useEntityInitialData();

  return (
    <Provider kind={kind} listPath={listPath}>
      {isLoading && <Loading />}
      {errorMessage && !isLoading && <Error message={errorMessage} />}
      {data && !isLoading && <Content />}
    </Provider>
  );
};

export default Details;
