import React, { ChangeEvent } from 'react';
import type { DataKind } from 'src/types';
import styled, { css } from 'styled-components';
import { Checkbox, SXStyles, Typography } from 'ui';

type DataKindBoxesProps = {
  setFieldFor: (
    ...kinds: DataKind[]
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  isFieldSelected: (...kinds: DataKind[]) => boolean;
  isFieldDisabled: (...kinds: DataKind[]) => boolean;
};

const DataKindBoxes = ({
  setFieldFor,
  isFieldSelected,
  isFieldDisabled,
}: DataKindBoxesProps) => (
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
        label="SSN (full)"
        disabled={isFieldDisabled('ssn9')}
        checked={isFieldSelected('ssn9')}
        onChange={setFieldFor('ssn9')}
      />
      <Checkbox
        label="SSN (last four)"
        disabled={isFieldDisabled('ssn4')}
        checked={isFieldSelected('ssn4') || isFieldSelected('ssn9')}
        onChange={setFieldFor('ssn4')}
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
        disabled={isFieldDisabled('addressLine1')}
        checked={isFieldSelected('addressLine1')}
        onChange={setFieldFor('addressLine1')}
      />
      <Checkbox
        label="Address line 2"
        disabled={isFieldDisabled('addressLine2')}
        checked={isFieldSelected('addressLine2')}
        onChange={setFieldFor('addressLine2')}
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
);

const DataGrid = styled.div`
  display: grid;
  grid-template: auto auto / repeat(2, minmax(0, 1fr));
  ${({ theme }) => css`
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

export default DataKindBoxes;
