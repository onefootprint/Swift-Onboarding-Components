import { IdDI, UsLegalStatus, type VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import EMPTY_SELECT_VALUE from '../../../../constants';

export type LegalStatusSelectProps = {
  value: VaultValue;
};

const LegalStatusSelect = ({ value }: LegalStatusSelectProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.edit.legal-status',
  });
  const { register, clearErrors } = useFormContext();
  const formField = IdDI.usLegalStatus;

  const options = [
    { value: EMPTY_SELECT_VALUE, label: t('legal-status-mapping.none') },
    { value: UsLegalStatus.citizen, label: t('legal-status-mapping.citizen') },
    { value: UsLegalStatus.permanentResident, label: t('legal-status-mapping.permanent_resident') },
    { value: UsLegalStatus.visa, label: t('legal-status-mapping.visa') },
  ];

  return (
    <ValueContainer>
      <Form.Select
        aria-label="Legal status"
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(formField, {
          onChange: () => clearErrors([IdDI.nationality, IdDI.citizenships, IdDI.visaKind, IdDI.visaExpirationDate]),
        })}
      >
        {options.map(status => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </Form.Select>
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
