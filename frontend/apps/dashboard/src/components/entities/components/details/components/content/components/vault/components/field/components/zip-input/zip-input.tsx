import styled from '@onefootprint/styled';
import { IdDI, type VaultValue } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import editFormFieldName from '../utils/edit-form-field-name';

export type ZipInputProps = {
  value: VaultValue;
};

const ZipInput = ({ value }: ZipInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.zip',
  });
  const {
    register,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(IdDI.zip);
  const hasError = !!errors[formField];
  const formCountryVal = watch(editFormFieldName(IdDI.country));

  const getHint = () => {
    if (!hasError) {
      return '';
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    return validateZip(getValues(formField));
  };

  const validateZip = (zip: string) => {
    if (formCountryVal === 'US') {
      if (!zip) {
        return t('required');
      }
      if (!/^\d{5}$/.test(zip)) {
        return t('pattern');
      }
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
        hasError={hasError}
        hint={getHint()}
        {...register(formField, {
          validate: (zip: string) => validateZip(zip) === undefined,
        })}
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
