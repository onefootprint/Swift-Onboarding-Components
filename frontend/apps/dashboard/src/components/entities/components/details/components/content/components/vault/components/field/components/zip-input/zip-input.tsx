import { BusinessDI, type DataIdentifier, IdDI, type VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import get from 'lodash/get';

export type ZipInputProps = {
  value: VaultValue;
  fieldName: DataIdentifier;
};

const ZipInput = ({ value, fieldName }: ZipInputProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.errors.zip',
  });
  const {
    register,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, fieldName);
  const isBusinessDI = fieldName in BusinessDI;
  const formCountryVal = watch(isBusinessDI ? BusinessDI.country : IdDI.country);

  const getHint = () => {
    if (!error) {
      return '';
    }
    const message = error?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    return validateZip(getValues(fieldName));
  };

  const validateZip = (zip: string) => {
    if (formCountryVal === 'US') {
      if (!zip) {
        return t('required');
      }
      if (!/^\d{5}$/.test(zip)) {
        return t('pattern');
      }
    }
    return undefined;
  };

  return (
    <ValueContainer>
      <Form.Input
        size="compact"
        width="fit-content"
        placeholder=""
        defaultValue={value as string}
        hasError={!!error}
        {...register(fieldName, {
          validate: (zip: string) => validateZip(zip) === undefined,
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

export default ZipInput;
