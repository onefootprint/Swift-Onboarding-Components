import type { AxiosError } from '@onefootprint/axios/dashboard';
import type { EntityKind } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import { ErrorComponent } from 'src/components';
import Page404 from 'src/components/404';
import Content from './components/content';
import Loading from './components/loading';
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

  if ((error as AxiosError)?.response?.status === 404) {
    return <Page404 />;
  }

  if (error) {
    return <ErrorComponent error={error} />;
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
