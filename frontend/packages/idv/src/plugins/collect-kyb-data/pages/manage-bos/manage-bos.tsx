import { useRequestErrorToast } from '@onefootprint/hooks';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import HeaderTitle from '../../../../components/layout/components/header-title';
import { useBusinessOwners, useBusinessOwnersPatch } from '../../../../queries';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import BosList from './components/bos-list';
import EditBosForm from './components/edit-bos-form';
import Loading from './components/loading';
import getDefaultFormValues, { isBoEditable } from './utils/get-default-form-values';

const ManageBos = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.manage-bos' });
  const [state, send] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
    bootstrapBusinessData,
    bootstrapUserData,
    config,
  } = state.context;
  const bosQuery = useBusinessOwners({ authToken });
  const bosMutation = useBusinessOwnersPatch();
  const showRequestErrorToast = useRequestErrorToast();

  const handleBosListSubmit = async ({ uuid, ownershipStake }: { uuid: string; ownershipStake: number }) => {
    if (!bosQuery.data || !authToken) throw new Error('Business owners data or authentication token is missing.');
    try {
      await bosMutation.mutateAsync({
        authToken,
        currentBos: bosQuery.data,
        updateOrCreateOperations: [{ uuid, ownershipStake, data: {} }],
        deleteOperations: [],
      });
    } catch (error) {
      showRequestErrorToast(error);
    }
  };

  if (bosQuery.isPending) {
    return <Loading />;
  }

  const handleDone = () => {
    send({ type: 'manageBosCompleted' });
  };

  const immutableBos = bosQuery.data?.filter(bo => !isBoEditable(bo)) || [];

  if (bosQuery.data) {
    return (
      <Stack direction="column" gap={5}>
        <CollectKybDataNavigationHeader />
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <BosList immutableBos={immutableBos} onSubmit={handleBosListSubmit} />
        <EditBosForm
          authToken={authToken}
          existingBos={bosQuery.data}
          onDone={handleDone}
          defaultFormValues={getDefaultFormValues(bosQuery.data, bootstrapBusinessData, bootstrapUserData)}
          isLive={!!config?.isLive}
        />
      </Stack>
    );
  }

  return null;
};

export default ManageBos;
