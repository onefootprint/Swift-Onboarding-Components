import type { EntityKind } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import { ErrorComponent } from 'src/components';

import Content from './components/content';
import Loading from './components/loading';
import TenantSwitcher from './components/tenant-switcher';
import useEntity from './hooks/use-entity';
import Provider from './hooks/use-entity-context';
import useEntityId from './hooks/use-entity-id';
import useEntityInitialData from './hooks/use-entity-initial-data';

export type DetailsProps = {
  kind: EntityKind;
  listPath: string;
};

const Details = ({ kind, listPath }: DetailsProps) => {
  const id = useEntityId();
  const { isPending, error } = useEntity(id);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return (
      <TenantSwitcher entityId={id} Loading={Loading}>
        <ErrorComponent error={error} />
      </TenantSwitcher>
    );
  }

  return <EntityDetails kind={kind} listPath={listPath} />;
};

const EntityDetails = ({ kind, listPath }: DetailsProps) => {
  const { isPending, error, data } = useEntityInitialData();

  return (
    <Box aria-busy={isPending}>
      <Provider kind={kind} listPath={listPath}>
        <>
          {isPending && <Loading />}
          {error && !isPending && <ErrorComponent error={error} />}
          {data && !isPending && <Content />}
        </>
      </Provider>
    </Box>
  );
};

export default Details;
