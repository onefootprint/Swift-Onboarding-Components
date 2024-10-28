import { BusinessDI } from '@onefootprint/types';
import { useRef, useState } from 'react';
import { getLogger } from '../../../../../../utils';
import useSyncData from '../../../../hooks/use-sync-data';
import Dialog from './components/confirm-missing-bo-dialog';

type ResolverFn = (shouldContinue: boolean) => void;

/** Async wrapper around showing the missing BOs confirmation dialog */
export const useConfirmMissingBoDialog = ({ authToken }: { authToken: string }) => {
  const { mutation } = useSyncData();
  const [isOpen, setIsOpen] = useState(false);
  const onCloseResolver = useRef<ResolverFn | undefined>(undefined);
  const { logWarn } = getLogger({ location: 'confirm-missing-bos-dialog' });

  const showConfirmationModal = () =>
    new Promise<boolean>(resolve => {
      // Opens the modal and sets the resolve callback that will be called when the modal is closed
      onCloseResolver.current = resolve;
      setIsOpen(true);
    });

  const closeModal = (shouldContinue: boolean) => {
    // Fulfill the promise that opened the modal and closes
    onCloseResolver.current?.(shouldContinue);
    setIsOpen(false);
  };

  const handleClose = () => {
    closeModal(false);
  };

  const handleSubmit = (note: string) => {
    if (!note) {
      closeModal(true);
      return;
    }

    mutation.mutate(
      {
        authToken,
        data: { [BusinessDI.beneficialOwnerExplanationMessage]: note },
      },
      {
        onError: (error: unknown) => {
          logWarn('Error sending business stake explanation message', error);
        },
        /** Don't block if we fail to save the note */
        onSettled: () => closeModal(true),
      },
    );
  };

  const ConfirmMissingBoDialog = () => <Dialog isOpen={isOpen} onClose={handleClose} onSubmit={handleSubmit} />;

  return { showConfirmationModal, ConfirmMissingBoDialog };
};

export default useConfirmMissingBoDialog;
