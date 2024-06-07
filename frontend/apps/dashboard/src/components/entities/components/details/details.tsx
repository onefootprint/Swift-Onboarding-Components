import type { EntityKind } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';
import { ErrorComponent } from 'src/components';

import Content from './components/content';
import Loading from './components/loading';
import TenantSwitcher from './components/tenant-switcher';
import Provider from './hooks/use-entity-context';
import useEntityId from './hooks/use-entity-id';
import useEntityInitialData from './hooks/use-entity-initial-data';

export type DetailsProps = {
  kind: EntityKind;
  listPath: string;
};

const Details = ({ kind, listPath }: DetailsProps) => {
  const id = useEntityId();
  const { isLoading, error, data } = useEntityInitialData();

  return (
    <Box aria-busy={isLoading}>
      <Provider kind={kind} listPath={listPath}>
        <>
          {isLoading && <Loading />}
          {error && !isLoading && (
            <TenantSwitcher entityId={id} Loading={Loading}>
              <ErrorComponent error={error} />
            </TenantSwitcher>
          )}
          {data && !isLoading && <Content />}
        </>
      </Provider>
    </Box>
  );
};

export default Details;
