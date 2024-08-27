import { COUNTRIES } from '@onefootprint/global-constants';
import { IdDI, type VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { Hint } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import EMPTY_SELECT_VALUE from '../../../../constants';
import editFormFieldName from '../utils/edit-form-field-name';

export type CountryOfBirthSelectProps = {
  value: VaultValue;
};

const CountryOfBirthSelect = ({ value }: CountryOfBirthSelectProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.edit' });
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(IdDI.nationality);
  const hasError = !!errors[formField];
  const formLegalStatus = watch(editFormFieldName(IdDI.usLegalStatus));

  const getHint = () => {
    if (!hasError) {
      return '';
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    if (errors[formField]?.type === 'validate') {
      return t('errors.nationality');
    }
    return '';
  };

  return (
    <ValueContainer>
      <Form.Select
        aria-label="Country of birth"
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(formField, {
          validate: (input: string) => {
            if (formLegalStatus !== EMPTY_SELECT_VALUE) {
              return input !== EMPTY_SELECT_VALUE;
            }
            return true;
          },
        })}
      >
        <option value={EMPTY_SELECT_VALUE}>{t('legal-status.nationality-mapping.none')}</option>
        {COUNTRIES.map(country => (
          <option key={country.value} value={country.value}>
            {country.label}
          </option>
        ))}
      </Form.Select>
      {hasError && <Hint hasError={hasError}>{getHint()}</Hint>}
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
  ${({ theme }) => css`
    max-width: 278px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex: 1;
    > select {
      height: ${theme.spacing[8]};
    }
    > .fp-hint {
      text-align: right;
    }
  `};
`;

export default CountryOfBirthSelect;
