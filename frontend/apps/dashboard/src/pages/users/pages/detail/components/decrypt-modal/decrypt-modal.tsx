import React, { useReducer, useState } from 'react';
import Modal, { ModalCloseEvent } from 'src/components/modal';
import { ALL_FIELDS, DataKind } from 'src/pages/users/hooks/use-decrypt-user';
import { User } from 'src/pages/users/hooks/use-join-users';
import { Button } from 'ui';

import AttributesScreen, {
  SelectedFields,
} from './components/attributes-screen';
import ReasonScreen from './components/reason-screen';

type DecryptModalProps = {
  user: User;
  onDecrypt: (
    fieldsToDecrypt: (keyof typeof DataKind)[],
    reason: string,
  ) => void;
};

const initialFields = Object.fromEntries(
  ALL_FIELDS.map(x => [x, false]),
) as SelectedFields;

const DecryptModal = ({ user, onDecrypt }: DecryptModalProps) => {
  // TODO: https://linear.app/footprint/issue/FP-240/migrate-to-react-form
  const [showModal, setShowModal] = useState(false);
  const [modalHasError, setModalHasError] = useState(false);
  const [modalScreen, setModalScreen] = useState<'attributes' | 'reason'>(
    'attributes',
  );
  const [selectedFields, updateSelectedFields] = useReducer(
    (oldState: SelectedFields, updates: SelectedFields) => ({
      ...oldState,
      ...updates,
    }),
    initialFields,
  );
  const [reason, setReason] = useState('');

  const isFieldDisabled = (...kinds: (keyof typeof DataKind)[]) =>
    // Don't allow requesting to decrypt a field that is either already decrypted OR explicitly null
    kinds.every(kind => user.decryptedAttributes?.[kind] !== undefined);

  const handleModalButtonClick = (type: ModalCloseEvent) => {
    if (type !== ModalCloseEvent.Primary) {
      setShowModal(false);
      return;
    }

    const fieldsToDecrypt = Object.entries(selectedFields)
      .filter(x => x[1])
      .filter(x => !isFieldDisabled(x[0] as keyof typeof DataKind))
      .map(x => x[0] as keyof typeof DataKind);
    if (modalScreen === 'attributes') {
      // Currently on the attributes screen
      // Decrypt all of the fields when the user closes the modal
      if (!fieldsToDecrypt.length) {
        // No fields selected, display validation error
        setModalHasError(true);
        return;
      }
      setModalHasError(false);
      setModalScreen('reason');
    } else {
      if (!reason) {
        // No reason provided, display validation error
        setModalHasError(true);
        return;
      }
      // Currently on the reason screen
      onDecrypt(fieldsToDecrypt, reason);
      setShowModal(false);
    }
  };

  const openModal = () => {
    // Refresh the state of the modal and open it
    updateSelectedFields(initialFields);
    setReason('');
    setModalHasError(false);
    setModalScreen('attributes');
    setShowModal(true);
  };

  return (
    <>
      {showModal && (
        <Modal
          size="compact"
          headerText="Decrypt data"
          primaryButtonText="Continue"
          secondaryButtonText="Cancel"
          onClose={handleModalButtonClick}
        >
          {modalScreen === 'attributes' && (
            <AttributesScreen
              hasError={modalHasError}
              selectedFields={selectedFields}
              updateSelectedFields={updateSelectedFields}
              isFieldDisabled={isFieldDisabled}
            />
          )}
          {modalScreen === 'reason' && (
            <ReasonScreen
              reason={reason}
              setReason={setReason}
              hasError={modalHasError}
            />
          )}
        </Modal>
      )}
      <Button size="small" variant="secondary" onClick={openModal}>
        Decrypt data
      </Button>
    </>
  );
};

export default DecryptModal;
