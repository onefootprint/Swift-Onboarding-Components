import { IdDI } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import get from 'lodash/get';
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
    watch,
    formState: { errors },
  } = useFormContext();
  const formField = IdDI.citizenships;
  const error = get(errors, formField);
  const formLegalStatus = watch(IdDI.usLegalStatus);

  return (
    <ValueContainer>
      <Form.Input
        size="compact"
        width="fit-content"
        placeholder="CA, MX"
        hasError={!!error}
        defaultValue={citizenships?.join(', ')}
        {...register(formField, {
          validate: (countriesStr: string) => {
            const validationError = validateCitizenships(countriesStr, formLegalStatus);
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
            return true;
          },
        })}
      />
      {error ? <Form.Errors>{error?.message}</Form.Errors> : <Form.Hint>{t('hint')}</Form.Hint>}
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    > .fp-hint {
      text-align: right;
    }
`;

export default CitizenshipsInput;
