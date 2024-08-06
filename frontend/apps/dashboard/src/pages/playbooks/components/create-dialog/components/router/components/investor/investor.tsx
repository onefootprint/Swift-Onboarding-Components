import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoPlusSmall16, IcoTrash16 } from '@onefootprint/icons';
import { LinkButton, Text } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Panel from '../panel';

const InvestorProfile = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.investor' });
  const { setValue, watch } = useFormContext<DataToCollectFormData>();
  const value = watch('person.investorProfile');

  const handleToggle = () => {
    setValue('person.investorProfile', !value);
  };

  const renderCta = () => {
    return value ? (
      <LinkButton destructive iconComponent={IcoTrash16} iconPosition="left" onClick={handleToggle} variant="label-4">
        {t('remove')}
      </LinkButton>
    ) : (
      <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={handleToggle} variant="label-4">
        {t('add')}
      </LinkButton>
    );
  };

  return (
    <Panel title={t('title')} cta={renderCta()}>
      {value ? (
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
            {t('questions.funding-sources')}
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
      ) : (
        <Text variant="body-3" color="tertiary">
          {t('subtitle')}
        </Text>
      )}
    </Panel>
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
