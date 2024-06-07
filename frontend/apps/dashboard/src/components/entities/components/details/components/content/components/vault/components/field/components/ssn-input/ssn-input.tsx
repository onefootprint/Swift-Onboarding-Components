import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import editFormFieldName from '../utils/edit-form-field-name';

export type SsnInputProps = {
  fieldName: DataIdentifier;
  fieldValue: VaultValue;
};

const SsnInput = ({ fieldName, fieldValue }: SsnInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.ssn',
  });
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(fieldName);
  const hasError = !!errors[formField];
  const pattern =
    fieldName === IdDI.ssn9 ? /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/ : /^((?!(0000))\d{4})$/;

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
        data-private
        size="compact"
        width="fit-content"
        placeholder=""
        hasError={hasError}
        hint={getHint()}
        defaultValue={fieldValue as string}
        type="tel"
        value={getValues(fieldName)}
        {...register(formField, {
          required: !!fieldValue,
          pattern,
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

export default SsnInput;
