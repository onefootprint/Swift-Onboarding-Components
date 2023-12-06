import { STATES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDI, type VaultValue } from '@onefootprint/types';
import { NativeSelect, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import editFormFieldName from '../utils/edit-form-field-name';

export type StateSelectProps = {
  value: VaultValue;
};

const StateSelect = ({ value }: StateSelectProps) => {
  const { t } = useTranslation('pages.entity.edit.errors');
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(IdDI.state);
  const formCountryVal = watch(editFormFieldName(IdDI.country));
  const isDomestic = formCountryVal === 'US';

  const getHint = () => {
    if (!errors[formField]) {
      return undefined;
    }
    const message = errors[formField]?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    return t('state');
  };

  return isDomestic ? (
    <ValueContainer>
      <NativeSelect
        data-private
        placeholder="Select"
        defaultValue={value as string}
        {...register(formField, {
          required: true,
        })}
      >
        {STATES.map(state => (
          <option key={state.value} value={state.value}>
            {state.label}
          </option>
        ))}
      </NativeSelect>
    </ValueContainer>
  ) : (
    <ValueContainer>
      <TextInput
        data-private
        size="compact"
        width="fit-content"
        placeholder=""
        defaultValue={value as string}
        hasError={!!errors[formField]}
        hint={getHint()}
        {...register(formField)}
      />
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
  ${({ theme }) => css`
    height: ${theme.spacing[8]};
    max-width: 181px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex: 1;
  `};

  > .fp-input-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
`;

export default StateSelect;
