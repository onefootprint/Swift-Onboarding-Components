import React, { ChangeEvent, useState } from 'react';
import Modal, { ModalCloseEvent } from 'src/components/modal';
import { DataKind } from 'src/pages/users/hooks/use-decrypt-user';
import { User } from 'src/pages/users/hooks/use-join-users';
import styled, { css } from 'styled-components';
import { Box, Button, Checkbox, Divider, TextArea, Typography } from 'ui';
import { SXStyles } from 'ui/src/hooks/use-sx';

type DecryptModalProps = {
  user: User;
  onDecrypt: (
    fieldsToDecrypt: (keyof typeof DataKind)[],
    reason: string,
  ) => void;
};

type SelectedFields = Record<keyof typeof DataKind, boolean>;

const ALL_FIELDS: (keyof typeof DataKind)[] = [
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'ssn',
  'dob',
  'country',
  'streetAddress',
  'streetAddress2',
  'city',
  'zip',
  'state',
];

const DecryptModal = ({ user, onDecrypt }: DecryptModalProps) => {
  // TODO: https://linear.app/footprint/issue/FP-240/migrate-to-react-form
  const [showModal, setShowModal] = useState(false);
  const [modalHasError, setModalHasError] = useState(false);
  // TODO: https://linear.app/footprint/issue/FP-257/migrate-each-page-of-modal-to-separate-component
  const [modalScreen, setModalScreen] = useState<'attributes' | 'reason'>(
    'attributes',
  );
  const [selectedFields, setSelectedFields] = useState<SelectedFields>(
    {} as SelectedFields,
  );
  const [reason, setReason] = useState('');

  const handleButtonClick = (type: ModalCloseEvent) => {
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
    setSelectedFields({} as SelectedFields);
    setReason('');
    setModalHasError(false);
    setModalScreen('attributes');
    setShowModal(true);
  };

  const isFieldDisabled = (...kinds: (keyof typeof DataKind)[]) =>
    kinds.every(kind => !!user.decryptedAttributes?.[kind]);

  const setFieldFor =
    (...kinds: (keyof typeof DataKind)[]) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      // Overwrite the selectedFields to match the checkbox value for all of the respective data kinds
      setSelectedFields({
        ...selectedFields,
        ...Object.fromEntries(kinds.map(x => [x, e.target.checked])),
      });
    };

  const isFieldSelected = (...kinds: (keyof typeof DataKind)[]) =>
    kinds.every(kind => selectedFields[kind] || isFieldDisabled(kind));

  return (
    <>
      {showModal && (
        <Modal
          size="compact"
          headerText="Decrypt data"
          primaryButtonText="Continue"
          secondaryButtonText="Cancel"
          onClose={handleButtonClick}
        >
          {modalScreen === 'attributes' && (
            <>
              <Typography variant="label-1" sx={{ marginTop: 5 }}>
                What data would you like to decrypt?
              </Typography>
              {modalHasError && (
                <Typography
                  variant="caption-1"
                  color="error"
                  sx={{ marginTop: 3 }}
                >
                  Choose at least one data attribute to continue.
                </Typography>
              )}
              <Box sx={{ marginTop: 7, marginBottom: 7 }}>
                <Checkbox
                  label="All"
                  disabled={isFieldDisabled(...ALL_FIELDS)}
                  checked={isFieldSelected(...ALL_FIELDS)}
                  onChange={setFieldFor(...ALL_FIELDS)}
                />
              </Box>
              <Divider />
              <DataGrid>
                {/* TODO do we want to disable all of the checkboxes for fields that have already been decrypted? */}
                <DataGridItem sx={{ gridArea: '1 / 1 / span 1 / span 1' }}>
                  <Typography variant="label-3" sx={{ marginBottom: 3 }}>
                    Basic data
                  </Typography>
                  <Checkbox
                    label="Name"
                    disabled={isFieldDisabled('firstName', 'lastName')}
                    checked={isFieldSelected('firstName', 'lastName')}
                    onChange={setFieldFor('firstName', 'lastName')}
                  />
                  <Checkbox
                    label="Email"
                    disabled={isFieldDisabled('email')}
                    checked={isFieldSelected('email')}
                    onChange={setFieldFor('email')}
                  />
                  <Checkbox
                    label="Phone number"
                    disabled={isFieldDisabled('phoneNumber')}
                    checked={isFieldSelected('phoneNumber')}
                    onChange={setFieldFor('phoneNumber')}
                  />
                </DataGridItem>
                <DataGridItem sx={{ gridArea: '2 / 1 / span 1 / span 1' }}>
                  <Typography variant="label-3" sx={{ marginBottom: 3 }}>
                    Identity data
                  </Typography>
                  <Checkbox
                    label="SSN"
                    disabled={isFieldDisabled('ssn')}
                    checked={isFieldSelected('ssn')}
                    onChange={setFieldFor('ssn')}
                  />
                  <Checkbox
                    label="Date of birth"
                    disabled={isFieldDisabled('dob')}
                    checked={isFieldSelected('dob')}
                    onChange={setFieldFor('dob')}
                  />
                </DataGridItem>
                <DataGridItem sx={{ gridArea: '1 / 2 / span 2 / span 1' }}>
                  <Typography variant="label-3" sx={{ marginBottom: 3 }}>
                    Address
                  </Typography>
                  <Checkbox
                    label="Country"
                    disabled={isFieldDisabled('country')}
                    checked={isFieldSelected('country')}
                    onChange={setFieldFor('country')}
                  />
                  <Checkbox
                    label="Address line 1"
                    disabled={isFieldDisabled('streetAddress')}
                    checked={isFieldSelected('streetAddress')}
                    onChange={setFieldFor('streetAddress')}
                  />
                  <Checkbox
                    label="Address line 2"
                    disabled={isFieldDisabled('streetAddress2')}
                    checked={isFieldSelected('streetAddress2')}
                    onChange={setFieldFor('streetAddress2')}
                  />
                  <Checkbox
                    label="City"
                    disabled={isFieldDisabled('city')}
                    checked={isFieldSelected('city')}
                    onChange={setFieldFor('city')}
                  />
                  <Checkbox
                    label="Zip code"
                    disabled={isFieldDisabled('zip')}
                    checked={isFieldSelected('zip')}
                    onChange={setFieldFor('zip')}
                  />
                  <Checkbox
                    label="State"
                    disabled={isFieldDisabled('state')}
                    checked={isFieldSelected('state')}
                    onChange={setFieldFor('state')}
                  />
                </DataGridItem>
              </DataGrid>
            </>
          )}
          {modalScreen === 'reason' && (
            <>
              <Typography
                variant="label-1"
                sx={{ marginTop: 5, marginBottom: 7 }}
              >
                Briefly describe why you need to decrypt this data.
              </Typography>
              <TextArea
                placeholder="Type the reason here..."
                hasError={modalHasError}
                hintText={modalHasError ? 'A reason is needed' : ''}
                value={reason}
                onChangeText={(value: string) => setReason(value)}
              />
              <Box sx={{ marginTop: 7, marginBottom: 7 }}>
                <Divider />
              </Box>
              <Typography variant="body-3" color="tertiary">
                Please note that all data attribute access are logged for
                security reasons.
              </Typography>
            </>
          )}
        </Modal>
      )}
      <Button size="small" variant="secondary" onClick={openModal}>
        Decrypt data
      </Button>
    </>
  );
};

const DataGrid = styled.div`
  display: grid;
  grid-template: auto auto / repeat(2, minmax(0, 1fr));
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]}px;
    gap: ${theme.spacing[7]}px;
  `};
`;

const DataGridItem = styled.div<{ sx: SXStyles }>`
  display: flex;
  flex-direction: column;
  ${({ theme }) => css`
    gap: ${theme.spacing[3]}px;
  `};
  ${({ sx }) => css`
    ${sx};
  `}
`;

export default DecryptModal;
