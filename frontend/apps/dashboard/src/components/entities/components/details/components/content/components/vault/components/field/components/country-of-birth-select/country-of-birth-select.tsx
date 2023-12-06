import { COUNTRIES } from '@onefootprint/global-constants';
import styled, { css } from '@onefootprint/styled';
import { IdDI, type VaultValue } from '@onefootprint/types';
import { NativeSelect } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import editFormFieldName from '../utils/edit-form-field-name';

export type CountryOfBirthSelectProps = {
  value: VaultValue;
};

const CountryOfBirthSelect = ({ value }: CountryOfBirthSelectProps) => {
  const { register } = useFormContext();
  const formField = editFormFieldName(IdDI.nationality);
  return (
    <ValueContainer>
      <NativeSelect
        data-private
        placeholder="Select"
        defaultValue={value as string}
        {...register(formField, {
          required: true,
        })}
      >
        {COUNTRIES.map(country => (
          <option value={country.value}>{country.label}</option>
        ))}
      </NativeSelect>
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
  ${({ theme }) => css`
    height: ${theme.spacing[8]};
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  `}
`;

export default CountryOfBirthSelect;
