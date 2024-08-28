import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import editFormFieldName from '../utils/edit-form-field-name';

export type CityInputProps = {
  value: VaultValue;
  fieldName: DataIdentifier;
};

const CityInput = ({ value, fieldName }: CityInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors',
  });
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const formField = editFormFieldName(fieldName);
  const hasError = !!errors[formField];

  const getHint = () => {
    if (!hasError) {
      return undefined;
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    return t('city');
  };

  return (
    <ValueContainer>
      <Form.Input
        size="compact"
        width="fit-content"
        placeholder=""
        hasError={hasError}
        defaultValue={value as string}
        {...register(formField, {
          required: true,
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

export default CityInput;
