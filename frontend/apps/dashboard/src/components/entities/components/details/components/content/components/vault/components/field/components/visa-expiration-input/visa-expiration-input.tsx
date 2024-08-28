import { IdDI, type VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import get from 'lodash/get';
import validateVisaExpiration, { VisaExpirationValidationError } from '../utils/validate-visa-expiration';

export type VisaExpirationInputProps = {
  value: VaultValue;
};

const VisaExpirationInput = ({ value }: VisaExpirationInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.visa-expiration',
  });
  const {
    register,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();
  const formField = IdDI.visaExpirationDate;
  const error = get(errors, formField);
  const formLegalStatus = watch(IdDI.usLegalStatus);

  const getHint = () => {
    if (!error) {
      return t('hint');
    }
    const message = error?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    if (error?.type === 'pattern') {
      return t('pattern');
    }
    const validationError = validateVisaExpiration(getValues(formField), formLegalStatus);
    if (validationError !== undefined) {
      const errorByValidationError: Record<VisaExpirationValidationError, string> = {
        [VisaExpirationValidationError.REQUIRED]: t('required'),
        [VisaExpirationValidationError.SHOULD_BE_EMPTY]: t('should-be-empty'),
        [VisaExpirationValidationError.INVALID]: t('invalid'),
        [VisaExpirationValidationError.INVALID_TIMEFRAME]: t('invalid-timeframe'),
      };
      return errorByValidationError[validationError];
    }
    return undefined;
  };

  return (
    <ValueContainer>
      <Form.Input
        size="compact"
        placeholder="YYYY-MM-DD"
        defaultValue={value as string}
        hasError={!!error}
        {...register(formField, {
          // YYYY-MM-DD or YYYY/MM/DD
          pattern: /^(?:\d{4}[-/]\d{2}[-/]\d{2})$/,
          validate: (expiration: string) => validateVisaExpiration(expiration, formLegalStatus) === undefined,
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
    > .fp-hint {
      text-align: right;
    }
  }
`;

export default VisaExpirationInput;
