import { type DataIdentifier, IdDI, type VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { isDobInTheFuture, isDobTooOld, isDobTooYoung, isValidDate } from '@onefootprint/core';
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
    formState: { errors },
  } = useFormContext();
  const error = get(errors, fieldName);
  const isDob = fieldName === IdDI.dob;

  return (
    <ValueContainer>
      <Form.Field>
        <Form.Input
          size="compact"
          width="fit-content"
          placeholder="YYYY-MM-DD"
          hasError={!!error}
          defaultValue={value as string}
          inputMode="numeric"
          {...register(fieldName, {
            required: {
              value: !!value,
              message: t('required'),
            },
            pattern: {
              value: /^(?:\d{4}[-/]\d{2}[-/]\d{2})$/, // YYYY-MM-DD or YYYY/MM/DD
              message: t('invalid'),
            },
            validate: (dateVal: string) => {
              if (!isValidDate(dateVal)) return t('pattern');
              if (isDobInTheFuture(dateVal)) return t('future-date');
              if (isDob) {
                if (isDobTooOld(dateVal)) return t('too-old');
                if (isDobTooYoung(dateVal)) return t('too-young');
              }
              return true;
            },
          })}
        />
        <Form.Errors>{error?.message}</Form.Errors>
      </Form.Field>
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
