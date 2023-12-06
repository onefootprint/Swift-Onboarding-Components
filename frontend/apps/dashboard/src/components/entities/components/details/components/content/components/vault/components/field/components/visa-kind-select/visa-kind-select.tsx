import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDI, type VaultValue, VisaKind } from '@onefootprint/types';
import { NativeSelect } from '@onefootprint/ui';
import Hint from '@onefootprint/ui/src/components/internal/hint';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import EMPTY_SELECT_VALUE from '../../../../constants';
import editFormFieldName from '../utils/edit-form-field-name';
import validateVisaKind, {
  VisaKindValidationError,
} from '../utils/validate-visa-kind';

export type VisaKindSelectProps = {
  value: VaultValue;
};

const VisaKindSelect = ({ value }: VisaKindSelectProps) => {
  const { t } = useTranslation('pages.entity.edit');
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
    const validationError = validateVisaKind(
      getValues(formField),
      formLegalStatus,
    );
    if (validationError !== undefined) {
      const errorByValidationError: Record<VisaKindValidationError, string> = {
        [VisaKindValidationError.REQUIRED]: t('errors.visa-kind.required'),
        [VisaKindValidationError.SHOULD_BE_EMPTY]: t(
          'errors.visa-kind.should-be-empty',
        ),
      };
      return errorByValidationError[validationError];
    }
    return '';
  };

  return (
    <ValueContainer>
      <NativeSelect
        data-private
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(formField, {
          validate: (visaKindVal: string) =>
            validateVisaKind(visaKindVal, formLegalStatus) === undefined,
        })}
      >
        <option value={EMPTY_SELECT_VALUE}>
          {t('legal-status.visa-kind-mapping.none')}
        </option>
        {Object.values(VisaKind).map(kind => (
          <option key={kind} value={kind}>
            {t(`legal-status.visa-kind-mapping.${kind}`)}
          </option>
        ))}
      </NativeSelect>
      <Hint hasError={hasError}>{getHint()}</Hint>
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
  ${({ theme }) => css`
    max-width: 181px;
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

export default VisaKindSelect;
