import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import HeaderTitle from '../../../../components/layout/components/header-title';
import { useBusinessOwners, useBusinessOwnersPatch } from '../../../../queries';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import BosForm from './components/bos-form';
import BosList from './components/bos-list';
import Loading from './components/loading';

const ManageBos = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.manage-bos' });
  const [state] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
  } = state.context;
  const bosQuery = useBusinessOwners({ authToken });
  const bosMutation = useBusinessOwnersPatch();

  if (bosQuery.isPending) {
    return <Loading />;
  }

  if (bosQuery.data) {
    return (
      <Stack direction="column" gap={5}>
        <CollectKybDataNavigationHeader />
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <BosList
          existingBos={bosQuery.data}
          onSubmit={async ({ uuid, ownershipStake }) => {
            await bosMutation.mutateAsync({
              authToken,
              currentBos: bosQuery.data,
              operations: [{ op: 'update', uuid, ownershipStake, data: {} }],
            });
            await bosQuery.refetch();
          }}
        />
        <BosForm
          existingBos={bosQuery.data}
          onSubmit={() => {
            // TODO: Implement submit logic
          }}
        />
      </Stack>
    );
  }

  return null;
};

export default ManageBos;
