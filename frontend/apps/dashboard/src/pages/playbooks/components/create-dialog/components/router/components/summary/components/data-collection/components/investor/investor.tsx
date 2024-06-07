import { IcoPlusSmall16, IcoTrash16 } from '@onefootprint/icons';
import { CollectedInvestorProfileDataOption } from '@onefootprint/types';
import { LinkButton, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const InvestorProfile = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.summary.data-collection.investor-profile',
  });
  const { register, setValue, watch } = useFormContext();

  const added = watch(CollectedInvestorProfileDataOption.investorProfile);
  const handleClick = () => setValue(CollectedInvestorProfileDataOption.investorProfile, !added);

  return (
    <Container>
      <Header>
        <Text variant="label-3">{t('title')}</Text>
        <input
          aria-hidden="true"
          aria-checked={added}
          role="switch"
          type="hidden"
          {...register(CollectedInvestorProfileDataOption.investorProfile)}
        />
        {added && (
          <LinkButton
            iconComponent={IcoTrash16}
            iconPosition="left"
            onClick={handleClick}
            variant="label-4"
            destructive
          >
            {t('toggle.remove')}
          </LinkButton>
        )}
        {!added && (
          <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={handleClick} variant="label-4">
            {t('toggle.add')}
          </LinkButton>
        )}
      </Header>
      {!added && <Text variant="body-3">{t('subtitle')}</Text>}
      {added && (
        <InvestorProfileQuestionContainer>
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
        </InvestorProfileQuestionContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} solid;
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
  `};
`;

const InvestorProfileQuestionContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    margin-left: ${theme.spacing[2]};
  `};
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export default InvestorProfile;
