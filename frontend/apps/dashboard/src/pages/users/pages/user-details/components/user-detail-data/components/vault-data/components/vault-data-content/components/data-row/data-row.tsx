import { Checkbox, Typography } from '@onefootprint/ui';
import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import FieldOrPlaceholder from 'src/pages/users/components/field-or-placeholder';
import { KycDataValue } from 'src/pages/users/users.types';
import styled from 'styled-components';

export type DataRowProps = {
  label: string;
  data?: KycDataValue;
  checkbox: {
    disabled: boolean;
    checked: boolean;
    visible: boolean;
    register: UseFormRegisterReturn;
  };
};

const DataRow = ({ label, data, checkbox }: DataRowProps) => {
  const { disabled, checked, visible, register } = checkbox;
  return (
    <DataRowContainer>
      {visible ? (
        <Checkbox
          checked={disabled || checked}
          {...register}
          disabled={disabled}
          label={label}
        />
      ) : (
        <Typography variant="label-3" color="tertiary">
          {label}
        </Typography>
      )}
      <FieldOrPlaceholder data={data} />
    </DataRowContainer>
  );
};

const DataRowContainer = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

export default DataRow;
