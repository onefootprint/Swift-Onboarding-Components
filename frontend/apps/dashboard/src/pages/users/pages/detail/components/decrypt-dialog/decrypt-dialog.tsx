import React, { useState } from 'react';
import useDataKindSelectedFields from 'src/components/data-kind-boxes/hooks/use-data-kind-selected-fields';
import { User } from 'src/pages/users/hooks/use-join-users';
import { DataKind, dataKindToType } from 'src/types';
import { Button, Dialog } from 'ui';

import AttributesScreen from './components/attributes-screen';
import ReasonScreen from './components/reason-screen';

type DecryptDialogProps = {
  user: User;
  onDecrypt: (fieldsToDecrypt: DataKind[], reason: string) => void;
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
  const allowedToDecryptFields = Array.from(
    new Set(
      user.onboardings.flatMap(link =>
        link.canAccessDataKinds.map(dataKind => dataKindToType[dataKind]),
      ),
    ),
  );
  // The user is allowed to decrypt a field if
  //   (1) the onboarding configuration gives access to decrypt it AND
  //   (2) the user vault has a value set for this field
  const decryptableFields = allowedToDecryptFields.filter(
    kind => user.attributes[kind]?.exists,
  );

  const isFieldSelected = (...kinds: DataKind[]) =>
    // Display box as checked if
    //   (1) the user checked it OR
    //   (2) it's decrypted OR
    //   (3) there's no value set
    kinds.every(
      kind =>
        selectedFields[kind] ||
        user.attributes[kind]?.value ||
        !user.attributes[kind]?.exists,
    );

  const isFieldDisabled = (...kinds: DataKind[]) =>
    // Don't allow decrypting a field that is already decrypted
    kinds.every(
      kind => user.attributes[kind]?.value || !decryptableFields.includes(kind),
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
      .filter(x => !isFieldDisabled(x[0] as DataKind))
      .map(x => x[0] as DataKind);
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
            allDecryptableFields={decryptableFields}
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
