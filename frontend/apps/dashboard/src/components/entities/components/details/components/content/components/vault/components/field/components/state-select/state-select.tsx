import { STATES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDI, type VaultValue } from '@onefootprint/types';
import { NativeSelect } from '@onefootprint/ui';
import Hint from '@onefootprint/ui/src/components/internal/hint';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import EMPTY_SELECT_VALUE from '../../../../constants';
import editFormFieldName from '../utils/edit-form-field-name';
import validateState, { StateValidationError } from '../utils/validate-state';

export type StateSelectProps = {
  value: VaultValue;
};

const StateSelect = ({ value }: StateSelectProps) => {
  const { t } = useTranslation('pages.entity.edit');
  const {
    register,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(IdDI.state);
  const hasError = !!errors[formField];
  const formCountryVal = watch(editFormFieldName(IdDI.country));
  const isDomestic = formCountryVal === 'US';

  const getHint = () => {
    if (!hasError) {
      return '';
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    const validationError = validateState(getValues(formField), isDomestic);
    if (validationError !== undefined) {
      const errorByValidationError: Record<StateValidationError, string> = {
        [StateValidationError.REQUIRED]: t('errors.state.required'),
        [StateValidationError.SHOULD_BE_EMPTY]: t(
          'errors.state.should-be-empty',
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
        aria-label="state"
        placeholder="Select"
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(formField, {
          validate: (newState: string) =>
            validateState(newState, isDomestic) === undefined,
        })}
      >
        <option value={EMPTY_SELECT_VALUE}>{t('state-mapping.none')}</option>
        {STATES.map(state => (
          <option key={state.value} value={state.value}>
            {state.label}
          </option>
        ))}
      </NativeSelect>
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
      width: 181px;
    }
    > .fp-hint {
      text-align: right;
    }
  `};
`;

export default StateSelect;
