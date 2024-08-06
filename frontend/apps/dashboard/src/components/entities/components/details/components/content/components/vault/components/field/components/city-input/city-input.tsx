import { IdDI, type VaultValue } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import editFormFieldName from '../utils/edit-form-field-name';

export type CityInputProps = {
  value: VaultValue;
};

const CityInput = ({ value }: CityInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors',
  });
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(IdDI.city);
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
      <TextInput
        data-dd-privacy="mask"
        size="compact"
        width="fit-content"
        placeholder=""
        hasError={hasError}
        hint={getHint()}
        defaultValue={value as string}
        {...register(formField, {
          required: true,
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

export default CityInput;
