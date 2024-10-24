import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import HeaderTitle from '../../../../components/layout/components/header-title';
import { useBusinessOwners } from '../../../../queries';
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
  const businessOwnersQuery = useBusinessOwners({ authToken });

  if (businessOwnersQuery.isPending) {
    return <Loading />;
  }

  if (businessOwnersQuery.data) {
    return (
      <Stack direction="column" gap={5}>
        <CollectKybDataNavigationHeader />
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <BosList
          existingBos={businessOwnersQuery.data}
          currentBo={businessOwnersQuery.data[0]}
          onSubmit={() => {
            // TODO: Implement submit logic
          }}
        />
        <BosForm
          existingBos={businessOwnersQuery.data}
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
