import { useBusinessOwnersPatch } from '@/idv/queries';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { HostedBusinessOwner } from '@onefootprint/request-types';
import { IdDI } from '@onefootprint/types';
import useConfirmMissingBoDialog from '../hooks/use-confirm-missing-bo-dialog';
import type { ManageBosFormData, NewBusinessOwner } from '../manage-bos.types';
import { sumTotalOwnershipStake } from '../utils/manage-bos.utils';
import BosForm, { type ConfirmProps } from './bos-form';

const MISSING_BOS_CONFIRMATION_THRESHOLD = 76;

export type EditBosFormProps = {
  authToken: string;
  existingBos: HostedBusinessOwner[];
  onDone: () => void;
  defaultFormValues: NewBusinessOwner[];
  isLive: boolean;
  confirmProps?: ConfirmProps;
};

const EditBosForm = ({ authToken, existingBos, onDone, confirmProps, defaultFormValues, isLive }: EditBosFormProps) => {
  const { showConfirmationModal, ConfirmMissingBoDialog } = useConfirmMissingBoDialog({ authToken });
  const showRequestErrorToast = useRequestErrorToast();
  const bosMutation = useBusinessOwnersPatch();

  const handleBosFormSubmit = async ({ bos, bosToDelete }: ManageBosFormData) => {
    const totalOwnershipStake = sumTotalOwnershipStake(existingBos, { bos, bosToDelete });
    if (totalOwnershipStake < MISSING_BOS_CONFIRMATION_THRESHOLD) {
      const shouldContinue = await showConfirmationModal();
      if (!shouldContinue) {
        return;
      }
    }

    if (!existingBos.length || !authToken) throw new Error('Business owners data or authentication token is missing.');

    const updateOrCreateOperations = bos.map(({ uuid, firstName, lastName, email, phoneNumber, ownershipStake }) => {
      const existingBo = existingBos.find(bo => bo.uuid === uuid);
      const isMutable = !existingBo || existingBo?.isMutable;
      const data = {
        [IdDI.firstName]: firstName,
        [IdDI.lastName]: lastName,
        [IdDI.email]: email,
        [IdDI.phoneNumber]: phoneNumber,
      };
      return {
        uuid,
        data: isMutable ? data : {},
        ownershipStake,
      };
    });

    try {
      await bosMutation.mutateAsync({
        authToken,
        currentBos: existingBos,
        updateOrCreateOperations,
        deleteOperations: bosToDelete,
      });
      onDone();
    } catch (error) {
      showRequestErrorToast(error);
    }
  };

  return (
    <>
      <BosForm
        existingBos={existingBos}
        onSubmit={handleBosFormSubmit}
        defaultFormValues={defaultFormValues}
        isLive={isLive}
        confirmProps={confirmProps}
        isBusy={bosMutation.isPending}
      />
      {ConfirmMissingBoDialog}
    </>
  );
};

export default EditBosForm;
