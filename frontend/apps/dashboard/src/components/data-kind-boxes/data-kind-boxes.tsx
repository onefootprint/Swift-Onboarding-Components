import { UserDataAttribute } from '@onefootprint/types';
import { Checkbox, SXStyles, Typography } from '@onefootprint/ui';
import React, { ChangeEvent } from 'react';
import styled, { css } from 'styled-components';

type DataKindBoxesProps = {
  setFieldFor: (
    ...kinds: UserDataAttribute[]
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  isFieldSelected: (...kinds: UserDataAttribute[]) => boolean;
  isFieldDisabled: (...kinds: UserDataAttribute[]) => boolean;
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
        disabled={isFieldDisabled(
          UserDataAttribute.firstName,
          UserDataAttribute.lastName,
        )}
        checked={isFieldSelected(
          UserDataAttribute.firstName,
          UserDataAttribute.lastName,
        )}
        onChange={setFieldFor(
          UserDataAttribute.firstName,
          UserDataAttribute.lastName,
        )}
      />
      <Checkbox
        label="Email"
        disabled={isFieldDisabled(UserDataAttribute.email)}
        checked={isFieldSelected(UserDataAttribute.email)}
        onChange={setFieldFor(UserDataAttribute.email)}
      />
      <Checkbox
        label="Phone number"
        disabled={isFieldDisabled(UserDataAttribute.phoneNumber)}
        checked={isFieldSelected(UserDataAttribute.phoneNumber)}
        onChange={setFieldFor(UserDataAttribute.phoneNumber)}
      />
    </DataGridItem>
    <DataGridItem sx={{ gridArea: '2 / 1 / span 1 / span 1' }}>
      <Typography variant="label-3" sx={{ marginBottom: 3 }}>
        Identity data
      </Typography>
      <Checkbox
        label="SSN (full)"
        disabled={isFieldDisabled(UserDataAttribute.ssn9)}
        checked={isFieldSelected(UserDataAttribute.ssn9)}
        onChange={setFieldFor(UserDataAttribute.ssn9)}
      />
      <Checkbox
        label="SSN (last four)"
        disabled={isFieldDisabled(UserDataAttribute.ssn4)}
        checked={
          isFieldSelected(UserDataAttribute.ssn4) ||
          isFieldSelected(UserDataAttribute.ssn9)
        }
        onChange={setFieldFor(UserDataAttribute.ssn4)}
      />
      <Checkbox
        label="Date of birth"
        disabled={isFieldDisabled(UserDataAttribute.dob)}
        checked={isFieldSelected(UserDataAttribute.dob)}
        onChange={setFieldFor(UserDataAttribute.dob)}
      />
    </DataGridItem>
    <DataGridItem sx={{ gridArea: '1 / 2 / span 2 / span 1' }}>
      <Typography variant="label-3" sx={{ marginBottom: 3 }}>
        Address
      </Typography>
      <Checkbox
        label="Country"
        disabled={isFieldDisabled(UserDataAttribute.country)}
        checked={isFieldSelected(UserDataAttribute.country)}
        onChange={setFieldFor(UserDataAttribute.country)}
      />
      <Checkbox
        label="Address line 1"
        disabled={isFieldDisabled(UserDataAttribute.addressLine1)}
        checked={isFieldSelected(UserDataAttribute.addressLine1)}
        onChange={setFieldFor(UserDataAttribute.addressLine1)}
      />
      <Checkbox
        label="Address line 2"
        disabled={isFieldDisabled(UserDataAttribute.addressLine2)}
        checked={isFieldSelected(UserDataAttribute.addressLine2)}
        onChange={setFieldFor(UserDataAttribute.addressLine2)}
      />
      <Checkbox
        label="City"
        disabled={isFieldDisabled(UserDataAttribute.city)}
        checked={isFieldSelected(UserDataAttribute.city)}
        onChange={setFieldFor(UserDataAttribute.city)}
      />
      <Checkbox
        label="Zip code"
        disabled={isFieldDisabled(UserDataAttribute.zip)}
        checked={isFieldSelected(UserDataAttribute.zip)}
        onChange={setFieldFor(UserDataAttribute.zip)}
      />
      <Checkbox
        label="State"
        disabled={isFieldDisabled(UserDataAttribute.state)}
        checked={isFieldSelected(UserDataAttribute.state)}
        onChange={setFieldFor(UserDataAttribute.state)}
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
