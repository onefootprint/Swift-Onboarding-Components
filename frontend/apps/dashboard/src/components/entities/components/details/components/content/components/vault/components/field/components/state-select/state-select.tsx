import { STATES } from '@onefootprint/global-constants';
import { IdDI, type VaultValue } from '@onefootprint/types';
import { Hint, NativeSelect, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import EMPTY_SELECT_VALUE from '../../../../constants';
import editFormFieldName from '../utils/edit-form-field-name';

export type StateSelectProps = {
  value: VaultValue;
};

const StateSelect = ({ value }: StateSelectProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.edit' });
  const {
    register,
    watch,
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
    return '';
  };

  return isDomestic ? (
    <ValueContainer>
      <NativeSelect
        data-private
        aria-label="state"
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(formField)}
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
  ) : (
    <ValueContainer>
      <TextInput
        data-private
        size="compact"
        width="fit-content"
        placeholder=""
        defaultValue={value as string}
        hasError={hasError}
        hint={getHint()}
        {...register(formField)}
      />
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
      width: 181px;
    }
    > .fp-hint {
      text-align: right;
    }
    > .fp-input-container {
      height: ${theme.spacing[8]};
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
  `};
`;

export default StateSelect;
