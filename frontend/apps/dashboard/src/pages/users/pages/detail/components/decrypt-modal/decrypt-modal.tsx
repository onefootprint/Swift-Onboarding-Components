import Modal, { ModalCloseEvent } from '@src/components/modal';
import { DataKind } from '@src/pages/users/hooks/use-decrypt-user';
import React, { ChangeEvent, useState } from 'react';
import styled, { css } from 'styled-components';
import { Box, Button, Checkbox, Divider, Typography } from 'ui';
import { SXStyles } from 'ui/src/hooks/use-sx';

type DecryptModalProps = {
  onDecrypt: (fieldsToDecrypt: DataKind[]) => void;
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

const DecryptModal = ({ onDecrypt }: DecryptModalProps) => {
  const [showModal, setShowModal] = useState(false);
  const [modalHasError, setModalHasError] = useState(false);
  // TODO: https://linear.app/footprint/issue/FP-240/migrate-to-react-form
  const [selectedFields, setSelectedFields] = useState<SelectedFields>(
    {} as SelectedFields,
  );

  const handleCloseModal = (type: ModalCloseEvent) => {
    if (type === ModalCloseEvent.Primary) {
      // Decrypt all of the fields when the user closes the modal
      const fieldsToDecrypt = Object.entries(selectedFields)
        .filter(x => x[1])
        .map(x => DataKind[x[0] as keyof typeof DataKind]);
      if (!fieldsToDecrypt.length) {
        // No fields selected, display validation error
        setModalHasError(true);
        return;
      }
      onDecrypt(fieldsToDecrypt);
    }
    setShowModal(false);
  };

  const openModal = () => {
    // Refresh the state of the modal and open it
    setSelectedFields({} as SelectedFields);
    setModalHasError(false);
    setShowModal(true);
  };

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
    kinds.every(kind => selectedFields[kind]);

  return (
    <>
      {showModal && (
        <Modal
          size="compact"
          headerText="Decrypt data"
          primaryButtonText="Continue"
          secondaryButtonText="Cancel"
          onClose={handleCloseModal}
        >
          <Typography variant="label-1" sx={{ marginTop: 5 }}>
            What data would you like to decrypt?
          </Typography>
          {modalHasError && (
            <Typography variant="caption-1" color="error" sx={{ marginTop: 3 }}>
              Choose at least one data attribute to continue.
            </Typography>
          )}
          <Box sx={{ marginTop: 7, marginBottom: 7 }}>
            <Checkbox
              label="All"
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
                checked={isFieldSelected('firstName', 'lastName')}
                onChange={setFieldFor('firstName', 'lastName')}
              />
              <Checkbox
                label="Email"
                checked={isFieldSelected('email')}
                onChange={setFieldFor('email')}
              />
              <Checkbox
                label="Phone number"
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
                checked={isFieldSelected('ssn')}
                onChange={setFieldFor('ssn')}
              />
              <Checkbox
                label="Date of birth"
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
                checked={isFieldSelected('country')}
                onChange={setFieldFor('country')}
              />
              <Checkbox
                label="Address line 1"
                checked={isFieldSelected('streetAddress')}
                onChange={setFieldFor('streetAddress')}
              />
              <Checkbox
                label="Address line 2"
                checked={isFieldSelected('streetAddress2')}
                onChange={setFieldFor('streetAddress2')}
              />
              <Checkbox
                label="City"
                checked={isFieldSelected('city')}
                onChange={setFieldFor('city')}
              />
              <Checkbox
                label="Zip code"
                checked={isFieldSelected('zip')}
                onChange={setFieldFor('zip')}
              />
              <Checkbox
                label="State"
                checked={isFieldSelected('state')}
                onChange={setFieldFor('state')}
              />
            </DataGridItem>
          </DataGrid>
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
