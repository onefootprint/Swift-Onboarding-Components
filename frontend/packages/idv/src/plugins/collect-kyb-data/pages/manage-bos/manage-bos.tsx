import { useRequestErrorToast } from '@onefootprint/hooks';
import { IdDI } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import HeaderTitle from '../../../../components/layout/components/header-title';
import { useBusinessOwners, useBusinessOwnersPatch } from '../../../../queries';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import ImmutableBosList from './components/immutable-bos-list';
import Loading from './components/loading';
import MutableBosForm from './components/mutable-bos-form';
import useConfirmMissingBoDialog from './hooks/use-confirm-missing-bo-dialog';
import type { ManageBosFormData } from './manage-bos.types';
import getDefaultFormValues from './utils/get-default-form-values';
import { sumTotalOwnershipStake } from './utils/manage-bos.utils';

const MISSING_BOS_CONFIRMATION_THRESHOLD = 76;

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
  const { showConfirmationModal, ConfirmMissingBoDialog } = useConfirmMissingBoDialog({ authToken });

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

  const handleBosFormSubmit = async ({ bos, bosToDelete }: ManageBosFormData) => {
    const totalOwnershipStake = sumTotalOwnershipStake(bosQuery.data ?? [], { bos, bosToDelete });
    if (totalOwnershipStake < MISSING_BOS_CONFIRMATION_THRESHOLD) {
      const shouldContinue = await showConfirmationModal();
      if (!shouldContinue) {
        return;
      }
    }

    if (!bosQuery.data || !authToken) throw new Error('Business owners data or authentication token is missing.');
    try {
      await bosMutation.mutateAsync({
        authToken,
        currentBos: bosQuery.data,
        updateOrCreateOperations: bos.map(({ uuid, firstName, lastName, email, phoneNumber, ownershipStake }) => ({
          uuid,
          data: {
            [IdDI.firstName]: firstName,
            [IdDI.lastName]: lastName,
            [IdDI.email]: email,
            [IdDI.phoneNumber]: phoneNumber,
          },
          ownershipStake,
        })),
        deleteOperations: bosToDelete,
      });
      send({ type: 'manageBosCompleted' });
    } catch (error) {
      showRequestErrorToast(error);
    }
  };

  if (bosQuery.isPending) {
    return <Loading />;
  }

  const immutableBos = bosQuery.data?.filter(bo => !bo.isMutable) || [];

  if (bosQuery.data) {
    return (
      <Stack direction="column" gap={5}>
        <CollectKybDataNavigationHeader />
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <ImmutableBosList immutableBos={immutableBos} onSubmit={handleBosListSubmit} />
        <MutableBosForm
          existingBos={bosQuery.data}
          onSubmit={handleBosFormSubmit}
          defaultFormValues={getDefaultFormValues(bosQuery.data, bootstrapBusinessData, bootstrapUserData)}
          isLive={!!config?.isLive}
        />
        <ConfirmMissingBoDialog />
      </Stack>
    );
  }

  return null;
};

export default ManageBos;
