import { useTranslation } from '@onefootprint/hooks';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const InvestorProfileQuestions = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create-dialog.kyc-collect-form.add-ons.investor-profile.questions',
  );

  return (
    <QuestionsContainer>
      <Question>{t('employment')}</Question>
      <Question>{t('brokerage-employment')}</Question>
      <Question>{t('income')}</Question>
      <Question>{t('net-worth')}</Question>
      <Question>{t('investment-goals')}</Question>
      <Question>{t('risk-tolerance')}</Question>
      <Question>{t('conflict-of-interest')}</Question>
    </QuestionsContainer>
  );
};

const QuestionsContainer = styled.ul`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    display: grid;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[5]};
    margin-top: ${theme.spacing[4]};
  `}
`;

const Question = styled.li`
  ${({ theme }) => css`
    list-style: disc;
    margin-left: ${theme.spacing[5]};
    ${createFontStyles('body-4')};
  `}
`;

export default InvestorProfileQuestions;
