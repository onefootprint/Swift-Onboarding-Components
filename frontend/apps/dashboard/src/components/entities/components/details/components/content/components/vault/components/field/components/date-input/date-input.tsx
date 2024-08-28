import { type DataIdentifier, IdDI, type VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { isDobInTheFuture, isDobTooOld, isDobTooYoung, isValidDate, isDob as isValidDob } from '@onefootprint/core';
import get from 'lodash/get';

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
  const error = get(errors, fieldName);
  const isDob = fieldName === IdDI.dob;

  const getHint = () => {
    if (!error) {
      return t('hint');
    }
    const message = error?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    if (error?.type === 'required') {
      return t('required');
    }
    if (error?.type === 'pattern') {
      return t('pattern');
    }
    const date = getValues(fieldName);
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
        hasError={!!error}
        defaultValue={value as string}
        inputMode="numeric"
        {...register(fieldName, {
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
      <Form.Errors>{getHint() || ''}</Form.Errors>
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
