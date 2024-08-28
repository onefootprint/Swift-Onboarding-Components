import { IdDI, type VaultValue, VisaKind } from '@onefootprint/types';
import { Form, Hint } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import get from 'lodash/get';
import EMPTY_SELECT_VALUE from '../../../../constants';
import validateVisaKind, { VisaKindValidationError } from '../utils/validate-visa-kind';

export type VisaKindSelectProps = {
  value: VaultValue;
};

const VisaKindSelect = ({ value }: VisaKindSelectProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.edit' });
  const {
    register,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();
  const formField = IdDI.visaKind;
  const error = get(errors, formField);
  const formLegalStatus = watch(IdDI.usLegalStatus);

  const getHint = () => {
    if (!error) {
      return '';
    }
    const message = error?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    const validationError = validateVisaKind(getValues(formField), formLegalStatus);
    if (validationError !== undefined) {
      const errorByValidationError: Record<VisaKindValidationError, string> = {
        [VisaKindValidationError.REQUIRED]: t('errors.visa-kind.required'),
        [VisaKindValidationError.SHOULD_BE_EMPTY]: t('errors.visa-kind.should-be-empty'),
      };
      return errorByValidationError[validationError];
    }
    return '';
  };

  return (
    <ValueContainer>
      <Form.Select
        aria-label="Visa type"
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(formField, {
          validate: (visaKindVal: string) => validateVisaKind(visaKindVal, formLegalStatus) === undefined,
        })}
      >
        <option value={EMPTY_SELECT_VALUE}>{t('legal-status.visa-kind-mapping.none')}</option>
        {Object.values(VisaKind).map(kind => (
          <option key={kind} value={kind}>
            {t(`legal-status.visa-kind-mapping.${kind}` as ParseKeys<'common'>)}
          </option>
        ))}
      </Form.Select>
      <Hint hasError={!!error}>{getHint()}</Hint>
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex: 1;
    > select {
      height: ${theme.spacing[8]};
      max-width: 181px;
    }
    > .fp-hint {
      text-align: right;
    }
  `};
`;

export default VisaKindSelect;
