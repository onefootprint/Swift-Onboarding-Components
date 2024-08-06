import { COUNTRIES } from '@onefootprint/global-constants';
import { IdDI, type VaultValue } from '@onefootprint/types';
import { NativeSelect } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import editFormFieldName from '../utils/edit-form-field-name';

export type AddressCountrySelectProps = {
  value: VaultValue;
};

const AddressCountrySelect = ({ value }: AddressCountrySelectProps) => {
  const { register } = useFormContext();
  const formField = editFormFieldName(IdDI.country);
  return (
    <ValueContainer>
      <NativeSelect
        data-dd-privacy="mask"
        aria-label="address country"
        defaultValue={value as string}
        {...register(formField, {
          required: true,
        })}
      >
        {COUNTRIES.map(country => (
          <option key={country.value} value={country.value}>
            {country.label}
          </option>
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

export default AddressCountrySelect;
