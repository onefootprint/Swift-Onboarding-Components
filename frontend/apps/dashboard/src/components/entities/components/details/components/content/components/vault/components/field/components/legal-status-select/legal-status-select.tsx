import { IdDI, UsLegalStatus, type VaultValue } from '@onefootprint/types';
import { NativeSelect } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import EMPTY_SELECT_VALUE from '../../../../constants';
import editFormFieldName from '../utils/edit-form-field-name';

export type LegalStatusSelectProps = {
  value: VaultValue;
};

const LegalStatusSelect = ({ value }: LegalStatusSelectProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.legal-status',
  });
  const { register, clearErrors } = useFormContext();
  const formField = editFormFieldName(IdDI.usLegalStatus);

  return (
    <ValueContainer>
      <NativeSelect
        data-private
        aria-label="Legal status"
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(formField, {
          onChange: () =>
            clearErrors([
              editFormFieldName(IdDI.nationality),
              editFormFieldName(IdDI.citizenships),
              editFormFieldName(IdDI.visaKind),
              editFormFieldName(IdDI.visaExpirationDate),
            ]),
        })}
      >
        <option value={EMPTY_SELECT_VALUE}>
          {t('legal-status-mapping.none')}
        </option>
        {Object.values(UsLegalStatus).map(status => (
          <option key={status} value={status}>
            {t(`legal-status-mapping.${status}` as ParseKeys<'common'>)}
          </option>
        ))}
      </NativeSelect>
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
  ${({ theme }) => css`
    height: ${theme.spacing[8]};
    max-width: 278px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex: 1;
  `};
`;

export default LegalStatusSelect;
