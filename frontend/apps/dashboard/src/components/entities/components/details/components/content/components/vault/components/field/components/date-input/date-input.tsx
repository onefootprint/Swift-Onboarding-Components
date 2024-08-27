import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import editFormFieldName from '../utils/edit-form-field-name';
import validateDob, { DobValidationError } from '../utils/validate-dob';

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

  const getHint = () => {
    const errorByValidationError: Record<DobValidationError, string> = {
      [DobValidationError.INVALID]: t('invalid'),
      [DobValidationError.FUTURE_DATE]: t('future-date'),
      [DobValidationError.TOO_YOUNG]: t('too-young'),
      [DobValidationError.TOO_OLD]: t('too-old'),
    };

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
    const validationError = validateDob(getValues(formField));
    return errorByValidationError[validationError ?? DobValidationError.INVALID];
  };

  return (
    <ValueContainer>
      <Form.Input
        data-dd-privacy="mask"
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
          validate: (dobVal: string) => !validateDob(dobVal),
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
