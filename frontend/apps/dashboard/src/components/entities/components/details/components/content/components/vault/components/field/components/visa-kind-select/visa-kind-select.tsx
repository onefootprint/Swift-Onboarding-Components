import { IdDI, type VaultValue, VisaKind } from '@onefootprint/types';
import { Form, Hint } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import EMPTY_SELECT_VALUE from '../../../../constants';
import editFormFieldName from '../utils/edit-form-field-name';
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
  const formField = editFormFieldName(IdDI.visaKind);
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
        data-dd-privacy="mask"
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
      <Hint hasError={hasError}>{getHint()}</Hint>
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
