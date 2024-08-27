import { STATES } from '@onefootprint/global-constants';
import { BusinessDI, type DataIdentifier, IdDI, type VaultValue } from '@onefootprint/types';
import { Form, Hint } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import EMPTY_SELECT_VALUE from '../../../../constants';
import editFormFieldName from '../utils/edit-form-field-name';

export type StateSelectProps = {
  fieldName: DataIdentifier;
  value: VaultValue;
};

const StateSelect = ({ value, fieldName }: StateSelectProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.edit' });
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const formField = editFormFieldName(fieldName);
  const hasError = !!errors[formField];

  const isBusinessDI = fieldName in BusinessDI;

  const formCountryVal = watch(editFormFieldName(isBusinessDI ? BusinessDI.country : IdDI.country));
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
      <Form.Select
        data-dd-privacy="mask"
        aria-label="state"
        size="compact"
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(formField)}
      >
        <option value={EMPTY_SELECT_VALUE}>{t('state-mapping.none')}</option>
        {STATES.map(state => (
          <option key={state.value} value={state.value}>
            {state.label}
          </option>
        ))}
      </Form.Select>
      <Hint hasError={hasError}>{getHint()}</Hint>
    </ValueContainer>
  ) : (
    <ValueContainer>
      <Form.Input
        data-dd-privacy="mask"
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
