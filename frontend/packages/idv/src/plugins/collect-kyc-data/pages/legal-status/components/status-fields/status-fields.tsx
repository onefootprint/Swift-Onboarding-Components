import { UsLegalStatus } from '@onefootprint/types';
import { Grid, Radio, media } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type StatusFieldsProps = {
  handleStatusChange: (newStatus: UsLegalStatus) => void;
};

const StatusFields = ({ handleStatusChange }: StatusFieldsProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.pages.legal-status.statuses',
  });
  const { register } = useFormContext();

  return (
    <Container data-dd-privacy="mask">
      <Radio
        value={UsLegalStatus.citizen}
        label={t('citizen')}
        {...register('usLegalStatus', {
          onChange: e => handleStatusChange(e.target.value),
        })}
        testID="citizen-radio"
      />
      <Radio
        value={UsLegalStatus.permanentResident}
        label={t('permanent-resident')}
        {...register('usLegalStatus', {
          onChange: e => handleStatusChange(e.target.value),
        })}
        testID="permanent-resident-radio"
      />
      <Radio
        value={UsLegalStatus.visa}
        label={t('visa')}
        {...register('usLegalStatus', {
          onChange: e => handleStatusChange(e.target.value),
        })}
        testID="visa-radio"
      />
    </Container>
  );
};

const Container = styled(Grid.Container)`
  ${({ theme }) => css`
    width: 100%;
    row-gap: ${theme.spacing[5]};

    ${media.lessThan('sm')`
      row-gap: ${theme.spacing[6]};
    `}
  `}
`;

export default StatusFields;
