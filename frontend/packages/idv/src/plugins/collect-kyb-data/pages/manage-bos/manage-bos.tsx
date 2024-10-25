import { useRequestErrorToast } from '@onefootprint/hooks';
import { IdDI } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import HeaderTitle from '../../../../components/layout/components/header-title';
import { useBusinessOwners, useBusinessOwnersPatch } from '../../../../queries';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import BosForm from './components/bos-form';
import BosList from './components/bos-list';
import Loading from './components/loading';
import type { NewBusinessOwner } from './manage-bos.types';

const ManageBos = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.manage-bos' });
  const [state, send] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
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
      await bosQuery.refetch();
    } catch (error) {
      showRequestErrorToast(error);
    }
  };

  const handleBosFormSubmit = async (formValues: NewBusinessOwner[]) => {
    if (!bosQuery.data || !authToken) throw new Error('Business owners data or authentication token is missing.');
    try {
      await bosMutation.mutateAsync({
        authToken,
        currentBos: bosQuery.data,
        updateOrCreateOperations: formValues.map(
          ({ uuid, firstName, lastName, email, phoneNumber, ownershipStake }) => ({
            uuid,
            data: {
              [IdDI.firstName]: firstName,
              [IdDI.lastName]: lastName,
              [IdDI.email]: email,
              [IdDI.phoneNumber]: phoneNumber,
            },
            ownershipStake,
          }),
        ),
        deleteOperations: [],
      });
      send({ type: 'manageBosCompleted' });
    } catch (error) {
      showRequestErrorToast(error);
    }
  };

  if (bosQuery.isPending) {
    return <Loading />;
  }

  if (bosQuery.data) {
    return (
      <Stack direction="column" gap={5}>
        <CollectKybDataNavigationHeader />
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <BosList existingBos={bosQuery.data} onSubmit={handleBosListSubmit} />
        <BosForm existingBos={bosQuery.data} onSubmit={handleBosFormSubmit} />
      </Stack>
    );
  }

  return null;
};

export default ManageBos;
