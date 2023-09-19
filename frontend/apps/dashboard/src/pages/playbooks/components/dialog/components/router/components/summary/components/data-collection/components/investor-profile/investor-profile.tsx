import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16, IcoTrash16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { CollectedInvestorProfileDataOption } from '@onefootprint/types';
import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const InvestorProfile = () => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.summary.data-collection.investor-profile',
  );
  const { register, setValue, watch } = useFormContext();

  const added = watch(CollectedInvestorProfileDataOption.investorProfile);
  const handleClick = () =>
    setValue(CollectedInvestorProfileDataOption.investorProfile, !added);

  return (
    <Container>
      <Header>
        <Typography variant="label-3">{t('title')}</Typography>
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
            size="tiny"
            variant="destructive"
          >
            {t('toggle.remove')}
          </LinkButton>
        )}
        {!added && (
          <LinkButton
            iconComponent={IcoPlusSmall16}
            iconPosition="left"
            onClick={handleClick}
            size="tiny"
          >
            {t('toggle.add')}
          </LinkButton>
        )}
      </Header>
      {!added && <Typography variant="body-3">{t('subtitle')}</Typography>}
      {added && (
        <InvestorProfileQuestionContainer>
          <Typography variant="body-3" as="li">
            {t('questions.employment-status')}
          </Typography>
          <Typography variant="body-3" as="li">
            {t('questions.annual-income')}
          </Typography>
          <Typography variant="body-3" as="li">
            {t('questions.net-worth')}
          </Typography>
          <Typography variant="body-3" as="li">
            {t('questions.investment-goals')}
          </Typography>
          <Typography variant="body-3" as="li">
            {t('questions.risk-tolerance')}
          </Typography>
          <Typography variant="body-3" as="li">
            {t('questions.immediate-family')}
          </Typography>
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
