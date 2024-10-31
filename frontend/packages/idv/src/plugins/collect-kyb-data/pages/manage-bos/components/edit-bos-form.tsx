import { useRequestErrorToast } from '@onefootprint/hooks';
import type { HostedBusinessOwner } from '@onefootprint/request-types';
import { IdDI } from '@onefootprint/types';
import { useBusinessOwnersPatch } from '../../../../../queries';
import useConfirmMissingBoDialog from '../hooks/use-confirm-missing-bo-dialog';
import type { ManageBosFormData, NewBusinessOwner } from '../manage-bos.types';
import { sumTotalOwnershipStake } from '../utils/manage-bos.utils';
import BosForm from './bos-form';

const MISSING_BOS_CONFIRMATION_THRESHOLD = 76;

export type EditBosFormProps = {
  authToken: string;
  existingBos: HostedBusinessOwner[];
  onDone: () => void;
  defaultFormValues: NewBusinessOwner[];
  isLive: boolean;
};

const EditBosForm = ({ authToken, existingBos, onDone, defaultFormValues, isLive }: EditBosFormProps) => {
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
    try {
      await bosMutation.mutateAsync({
        authToken,
        currentBos: existingBos,
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
      />
      {ConfirmMissingBoDialog}
    </>
  );
};

export default EditBosForm;
