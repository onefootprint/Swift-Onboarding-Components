import { IdDI } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import editFormFieldName from '../utils/edit-form-field-name';
import validateCitizenships, { CitizenshipsValidationError } from '../utils/validate-citizenships';

export type CitizenshipsInputProps = {
  citizenships?: string[];
};

const CitizenshipsInput = ({ citizenships }: CitizenshipsInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.citizenships',
  });
  const {
    register,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(IdDI.citizenships);
  const hasError = !!errors[formField];
  const formLegalStatus = watch(editFormFieldName(IdDI.usLegalStatus));

  const getHint = () => {
    if (!hasError) {
      return t('hint');
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    const validationError = validateCitizenships(getValues(formField), formLegalStatus);
    if (validationError?.errorType === CitizenshipsValidationError.REQUIRED) {
      return t('required');
    }
    if (validationError?.errorType === CitizenshipsValidationError.SHOULD_BE_EMPTY) {
      return t('should-be-empty');
    }
    if (validationError?.errorType === CitizenshipsValidationError.US_CITIZENSHIP) {
      return t('us-citizenship');
    }
    if (validationError?.errorType === CitizenshipsValidationError.INVALID) {
      return t('invalid', { countries: validationError.data });
    }
    return undefined;
  };

  return (
    <ValueContainer>
      <Form.Input
        size="compact"
        width="fit-content"
        placeholder="CA, MX"
        hasError={hasError}
        hint={getHint()}
        defaultValue={citizenships?.join(', ')}
        {...register(formField, {
          validate: (countriesStr: string) => validateCitizenships(countriesStr, formLegalStatus) === undefined,
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
    max-width: 278px;
    > .fp-hint {
      text-align: right;
    }
  }
`;

export default CitizenshipsInput;
