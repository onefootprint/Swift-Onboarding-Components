import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import editFormFieldName from '../utils/edit-form-field-name';

export type AddressLineInputProps = {
  fieldName: DataIdentifier;
  fieldValue: VaultValue;
};

const AddressLineInput = ({ fieldName, fieldValue }: AddressLineInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.address-line',
  });
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(fieldName);
  const hasError = !!errors[formField];
  const options =
    fieldName === IdDI.addressLine1
      ? {
          required: true,
          pattern: /^(?!p\.?o\.?\s*?(?:box)?\s*?[0-9]+?).*$/i,
        }
      : {};

  const getHint = () => {
    if (!hasError) {
      return undefined;
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    if (errors[formField]?.type) {
      return t(`${errors[formField]?.type}` as ParseKeys<'common'>);
    }
    return undefined;
  };

  return (
    <ValueContainer>
      <TextInput
        data-dd-privacy="mask"
        size="compact"
        width="fit-content"
        placeholder=""
        defaultValue={fieldValue as string}
        hasError={hasError}
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

export default AddressLineInput;
