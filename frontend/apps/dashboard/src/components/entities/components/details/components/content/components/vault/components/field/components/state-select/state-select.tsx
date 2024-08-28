import { STATES } from '@onefootprint/global-constants';
import { BusinessDI, type DataIdentifier, IdDI, type VaultValue } from '@onefootprint/types';
import { Form, Hint } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import get from 'lodash/get';
import EMPTY_SELECT_VALUE from '../../../../constants';

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
  const error = get(errors, fieldName);
  const isBusinessDI = fieldName in BusinessDI;
  const formCountryVal = watch(isBusinessDI ? BusinessDI.country : IdDI.country);
  const isDomestic = formCountryVal === 'US';

  const getHint = () => {
    if (!error) {
      return '';
    }
    const message = error?.message;
    if (message && typeof message === 'string') {
      return message;
    }
    return '';
  };

  return isDomestic ? (
    <ValueContainer>
      <Form.Select
        aria-label="state"
        size="compact"
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(fieldName)}
      >
        <option value={EMPTY_SELECT_VALUE}>{t('state-mapping.none')}</option>
        {STATES.map(state => (
          <option key={state.value} value={state.value}>
            {state.label}
          </option>
        ))}
      </Form.Select>
      <Hint hasError={!!error}>{getHint()}</Hint>
    </ValueContainer>
  ) : (
    <ValueContainer>
      <Form.Input
        size="compact"
        width="fit-content"
        placeholder=""
        defaultValue={value as string}
        hasError={!!error}
        {...register(fieldName)}
      />
      <Form.Errors>{getHint() || ''}</Form.Errors>
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
