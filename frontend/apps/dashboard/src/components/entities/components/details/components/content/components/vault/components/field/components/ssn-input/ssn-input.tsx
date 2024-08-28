import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import get from 'lodash/get';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export type SsnInputProps = {
  fieldName: DataIdentifier;
  fieldValue: VaultValue;
};

const SsnInput = ({ fieldName, fieldValue }: SsnInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.ssn',
  });
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, fieldName);
  const pattern =
    fieldName === IdDI.ssn9 ? /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/ : /^((?!(0000))\d{4})$/;

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
        hasError={!!error}
        defaultValue={fieldValue as string}
        type="tel"
        value={getValues(fieldName)}
        {...register(fieldName, {
          required: !!fieldValue,
          pattern,
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

export default SsnInput;
