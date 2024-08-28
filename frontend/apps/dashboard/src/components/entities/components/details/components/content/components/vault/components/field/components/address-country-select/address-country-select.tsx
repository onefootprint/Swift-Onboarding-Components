import { COUNTRIES } from '@onefootprint/global-constants';
import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { NativeSelect } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

export type AddressCountrySelectProps = {
  value: VaultValue;
  fieldName: DataIdentifier;
};

const AddressCountrySelect = ({ value, fieldName }: AddressCountrySelectProps) => {
  const { register } = useFormContext();

  return (
    <ValueContainer>
      <NativeSelect
        size="compact"
        data-dd-privacy="mask"
        aria-label="address country"
        defaultValue={value as string}
        {...register(fieldName, {
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
