import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import get from 'lodash/get';
import validateName, { NameValidationError } from '../utils/validate-name';

export type NameInputProps = {
  fieldName: DataIdentifier;
  fieldValue: VaultValue;
};

const NameInput = ({ fieldName, fieldValue }: NameInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.name',
  });
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, fieldName);
  const options =
    fieldName === IdDI.middleName || !fieldValue
      ? {
          validate: (value: string) => validateName(value) !== NameValidationError.SPECIAL_CHARS,
        }
      : {
          required: true,
          validate: (value: string) => validateName(value) === undefined,
        };

  const getHint = () => {
    if (!error) {
      return undefined;
    }
    const message = error?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    if (error?.type === 'required') {
      return t('required');
    }
    const validationError = validateName(getValues(fieldName));
    if (validationError === NameValidationError.SPECIAL_CHARS) {
      return t('special-chars');
    }
    return undefined;
  };

  return (
    <ValueContainer>
      <Form.Input
        size="compact"
        width="fit-content"
        placeholder=""
        hasError={!!error}
        defaultValue={fieldValue as string}
        {...register(fieldName, options)}
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

export default NameInput;
