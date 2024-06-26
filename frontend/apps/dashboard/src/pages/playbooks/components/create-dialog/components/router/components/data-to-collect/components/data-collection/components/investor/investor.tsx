import { CollectedInvestorProfileDataOption } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import TogglePanel from '../toggle-panel';

const InvestorProfile = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.data-to-collect.investor-profile' });
  const { register, setValue, watch } = useFormContext();
  const value = watch(CollectedInvestorProfileDataOption.investorProfile);

  const toggle = () => setValue(CollectedInvestorProfileDataOption.investorProfile, !value);

  return (
    <TogglePanel onAdd={toggle} onRemove={toggle} subtitle={t('subtitle')} title={t('title')} value={value}>
      <input type="hidden" {...register(CollectedInvestorProfileDataOption.investorProfile)} />
      <List>
        <Text variant="body-3" tag="li">
          {t('questions.employment-status')}
        </Text>
        <Text variant="body-3" tag="li">
          {t('questions.annual-income')}
        </Text>
        <Text variant="body-3" tag="li">
          {t('questions.net-worth')}
        </Text>
        <Text variant="body-3" tag="li">
          {t('questions.investment-goals')}
        </Text>
        <Text variant="body-3" tag="li">
          {t('questions.risk-tolerance')}
        </Text>
        <Text variant="body-3" tag="li">
          {t('questions.immediate-family')}
        </Text>
      </List>
    </TogglePanel>
  );
};

const List = styled.ul`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    margin-left: ${theme.spacing[2]};

    li {
      list-style: inside;
    }
  `};
`;

export default InvestorProfile;
