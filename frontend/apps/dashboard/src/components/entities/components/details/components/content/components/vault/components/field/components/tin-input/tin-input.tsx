import { isTin as isValidTin } from '@onefootprint/core';
import type { VaultValue } from '@onefootprint/types';
import { BusinessDI } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import get from 'lodash/get';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export type TinInputProps = {
  value: VaultValue;
};

const TinInput = ({ value }: TinInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.tin',
  });
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const formField = BusinessDI.tin;
  const error = get(errors, formField);

  return (
    <ValueContainer>
      <Form.Field>
        <Form.Input
          size="compact"
          width="fit-content"
          placeholder=""
          hasError={!!error}
          defaultValue={value as string}
          inputMode="numeric"
          {...register(formField, {
            required: {
              value: !!value,
              message: t('required'),
            },
            validate: (tin: string) => {
              if (!isValidTin(tin)) return t('invalid');
              return true;
            },
          })}
        />
        {error ? <Form.Errors>{error.message}</Form.Errors> : <Form.Hint>{t('hint')}</Form.Hint>}
      </Form.Field>
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
  > * {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
`;

export default TinInput;
