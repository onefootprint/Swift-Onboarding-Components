import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import editFormFieldName from '../utils/edit-form-field-name';
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
  const formField = editFormFieldName(fieldName);
  const hasError = !!errors[formField];
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
    if (!hasError) {
      return undefined;
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    if (errors[formField]?.type === 'required') {
      return t('required');
    }
    const validationError = validateName(getValues(formField));
    if (validationError === NameValidationError.SPECIAL_CHARS) {
      return t('special-chars');
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
        hasError={hasError}
        hint={getHint()}
        defaultValue={fieldValue as string}
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

export default NameInput;
