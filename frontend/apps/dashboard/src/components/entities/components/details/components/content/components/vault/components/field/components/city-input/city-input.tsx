import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import get from 'lodash/get';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

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
  const error = get(errors, fieldName);

  const getHint = () => {
    if (!error) {
      return undefined;
    }
    const message = error?.message;
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
        hasError={!!error}
        defaultValue={value as string}
        {...register(fieldName, {
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
