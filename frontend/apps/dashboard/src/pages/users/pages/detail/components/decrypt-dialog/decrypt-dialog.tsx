import React, { useState } from 'react';
import useDataKindSelectedFields from 'src/components/data-kind-boxes/hooks/use-data-kind-selected-fields';
import { User } from 'src/pages/users/hooks/use-join-users';
import { DataKindType } from 'src/types';
import { Button, Dialog } from 'ui';

import AttributesScreen from './components/attributes-screen';
import ReasonScreen from './components/reason-screen';

type DecryptDialogProps = {
  user: User;
  onDecrypt: (fieldsToDecrypt: DataKindType[], reason: string) => void;
};

const DecryptDialog = ({ user, onDecrypt }: DecryptDialogProps) => {
  // TODO: https://linear.app/footprint/issue/FP-240/migrate-to-react-form
  const [showDialog, setShowDialog] = useState(false);
  const [dialogHasError, setDialogHasError] = useState(false);
  const [dialogScreen, setDialogScreen] = useState<'attributes' | 'reason'>(
    'attributes',
  );
  const [reason, setReason] = useState('');
  const { selectedFields, setFieldFor, clearSelectedFields } =
    useDataKindSelectedFields();

  const isFieldSelected = (...kinds: DataKindType[]) =>
    kinds.every(kind => selectedFields[kind] || isFieldDisabled(kind));

  const isFieldDisabled = (...kinds: DataKindType[]) =>
    // Don't allow requesting to decrypt a field that is either already decrypted OR explicitly null
    kinds.every(
      kind => user.attributes[kind]?.value || !user.attributes[kind]?.exists,
    );

  const openDialog = () => {
    // Refresh the state of the dialog and open it
    clearSelectedFields();
    setReason('');
    setDialogHasError(false);
    setDialogScreen('attributes');
    setShowDialog(true);
  };

  const onPrimaryButtonClick = () => {
    const fieldsToDecrypt = Object.entries(selectedFields)
      .filter(x => x[1])
      .filter(x => !isFieldDisabled(x[0] as DataKindType))
      .map(x => x[0] as DataKindType);
    if (dialogScreen === 'attributes') {
      // Currently on the attributes screen
      if (!fieldsToDecrypt.length) {
        // No fields selected, display validation error
        setDialogHasError(true);
        return;
      }
      setDialogHasError(false);
      setDialogScreen('reason');
    } else {
      // Currently on the reason screen
      if (!reason) {
        // No reason provided, display validation error
        setDialogHasError(true);
        return;
      }
      onDecrypt(fieldsToDecrypt, reason);
      setShowDialog(false);
    }
  };

  return (
    <>
      <Dialog
        size="compact"
        title="Decrypt data"
        primaryButton={{
          label: 'Continue',
          onClick: onPrimaryButtonClick,
        }}
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setShowDialog(false),
        }}
        onClose={() => setShowDialog(false)}
        open={showDialog}
      >
        {dialogScreen === 'attributes' && (
          <AttributesScreen
            hasError={dialogHasError}
            isFieldSelected={isFieldSelected}
            setFieldFor={setFieldFor}
            isFieldDisabled={isFieldDisabled}
          />
        )}
        {dialogScreen === 'reason' && (
          <ReasonScreen
            reason={reason}
            setReason={setReason}
            hasError={dialogHasError}
          />
        )}
      </Dialog>
      <Button size="small" variant="secondary" onClick={openDialog}>
        Decrypt data
      </Button>
    </>
  );
};

export default DecryptDialog;
