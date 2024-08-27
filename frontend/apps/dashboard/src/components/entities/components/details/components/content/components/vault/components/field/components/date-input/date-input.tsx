import { type DataIdentifier, IdDI, type VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { isDobInTheFuture, isDobTooOld, isDobTooYoung, isValidDate, isDob as isValidDob } from '@onefootprint/core';
import editFormFieldName from '../utils/edit-form-field-name';

export type DateInputProps = {
  value: VaultValue;
  fieldName: DataIdentifier;
};

const DateInput = ({ value, fieldName }: DateInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.dob',
  });
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(fieldName);
  const hasError = !!errors[formField];
  const isDob = fieldName === IdDI.dob;

  const getHint = () => {
    if (!hasError) {
      return t('hint');
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    if (errors[formField]?.type === 'required') {
      return t('required');
    }
    if (errors[formField]?.type === 'pattern') {
      return t('pattern');
    }
    const date = getValues(formField);
    if (!isValidDate(date)) {
      return t('invalid');
    }
    if (isDobInTheFuture(date)) {
      return t('future-date');
    }
    if (isDobTooOld(date)) {
      return t('too-old');
    }
    if (isDobTooYoung(date)) {
      return t('too-young');
    }
  };

  return (
    <ValueContainer>
      <Form.Input
        size="compact"
        width="fit-content"
        placeholder="YYYY-MM-DD"
        hasError={hasError}
        hint={getHint()}
        defaultValue={value as string}
        inputMode="numeric"
        {...register(formField, {
          required: !!value,
          pattern: /^(?:\d{4}[-/]\d{2}[-/]\d{2})$/, // YYYY-MM-DD or YYYY/MM/DD
          validate: (dateVal: string) => {
            if (!isValidDate(dateVal)) return false;
            if (isDob) {
              return isValidDob(dateVal, new Date());
            }
            return !isDobInTheFuture(dateVal);
          },
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

export default DateInput;
