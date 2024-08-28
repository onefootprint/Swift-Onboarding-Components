import { isAddressLine } from '@onefootprint/core';
import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
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

  return (
    <ValueContainer>
      <Form.Input
        size="compact"
        width="fit-content"
        placeholder=""
        defaultValue={fieldValue as string}
        hasError={!!error}
        {...register(fieldName, {
          validate: (value: string) => {
            if (fieldName === IdDI.addressLine1) {
              if (!value) {
                return t('required');
              }
              if (!isAddressLine(value)) {
                return t('pattern');
              }
            }
            return true;
          },
        })}
      />
      <Form.Errors>{error?.message}</Form.Errors>
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
