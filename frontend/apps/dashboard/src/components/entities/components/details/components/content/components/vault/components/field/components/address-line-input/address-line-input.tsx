import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import get from 'lodash/get';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export type AddressLineInputProps = {
  fieldName: DataIdentifier;
  fieldValue: VaultValue;
};

const AddressLineInput = ({ fieldName, fieldValue }: AddressLineInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.address-line',
  });
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, fieldName);
  const options =
    fieldName === IdDI.addressLine1
      ? {
          required: true,
          pattern: /^(?!p\.?o\.?\s*?(?:box)?\s*?[0-9]+?).*$/i,
        }
      : {};

  const getHint = () => {
    if (!error) {
      return undefined;
    }
    const message = error?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    if (error?.type) {
      return t(`${error?.type}` as ParseKeys<'common'>);
    }
    return undefined;
  };

  return (
    <ValueContainer>
      <Form.Input
        size="compact"
        width="fit-content"
        placeholder=""
        defaultValue={fieldValue as string}
        hasError={!!error}
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

export default AddressLineInput;
