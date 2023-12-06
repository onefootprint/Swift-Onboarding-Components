import { COUNTRIES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { IdDI, type VaultValue } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import editFormFieldName from '../utils/edit-form-field-name';

export type ZipInputProps = {
  value: VaultValue;
};

const ZipInput = ({ value }: ZipInputProps) => {
  const { t } = useTranslation('pages.entity.edit.errors.zip');
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(IdDI.zip);
  const hasError = !!errors[formField];
  const formCountryVal = watch(editFormFieldName(IdDI.country));
  const country = COUNTRIES.find(entry => entry.value === formCountryVal);
  const options =
    country?.value === 'US' ? { required: true, pattern: /^\d{5}$/ } : {};

  const getHint = () => {
    if (!hasError) {
      return undefined;
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    if (errors[formField]?.type) {
      return t(`${errors[formField]?.type}`);
    }
    return undefined;
  };

  return (
    <ValueContainer>
      <TextInput
        data-private
        size="compact"
        width="fit-content"
        placeholder=""
        defaultValue={value as string}
        hasError={!!errors[formField]}
        hint={getHint()}
        {...register(formField, options)}
      />
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
  > .fp-input-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
`;

export default ZipInput;
