import React, { ChangeEvent } from 'react';
import { DataKindType } from 'src/types';
import styled, { css } from 'styled-components';
import { Checkbox, Typography } from 'ui';
import { SXStyles } from 'ui/src/hooks/use-sx';

type DataKindBoxesProps = {
  setFieldFor: (
    ...kinds: DataKindType[]
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  isFieldSelected: (...kinds: DataKindType[]) => boolean;
  isFieldDisabled: (...kinds: DataKindType[]) => boolean;
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
