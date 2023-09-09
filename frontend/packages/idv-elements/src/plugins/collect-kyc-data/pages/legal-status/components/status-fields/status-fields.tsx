import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { UsLegalStatus } from '@onefootprint/types';
import { media, Radio } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

type StatusFieldsProps = {
  handleStatusChange: () => void;
};

const StatusFields = ({ handleStatusChange }: StatusFieldsProps) => {
  const { t } = useTranslation('pages.legal-status.statuses');
  const { register } = useFormContext();

  return (
    <Container data-private>
      <Radio
        value={UsLegalStatus.citizen}
        label={t('citizen')}
        {...register('usLegalStatus', { onChange: handleStatusChange })}
        testID="citizen-radio"
      />
      <Radio
        value={UsLegalStatus.permanentResident}
        label={t('permanent-resident')}
        {...register('usLegalStatus', { onChange: handleStatusChange })}
        testID="permanent-resident-radio"
      />
      <Radio
        value={UsLegalStatus.visa}
        label={t('visa')}
        {...register('usLegalStatus', { onChange: handleStatusChange })}
        testID="visa-radio"
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: grid;
    row-gap: ${theme.spacing[5]};

    ${media.lessThan('sm')`
      row-gap: ${theme.spacing[6]};
    `}
  `}
`;

export default StatusFields;
