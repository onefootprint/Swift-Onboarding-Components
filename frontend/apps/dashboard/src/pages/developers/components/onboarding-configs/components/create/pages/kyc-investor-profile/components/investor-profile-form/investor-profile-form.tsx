import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';
import AnimatedContainer from 'src/components/animated-container';

type InvestorProfileFormProps = {
  isExpanded: boolean;
};

const InvestorProfileForm = ({ isExpanded }: InvestorProfileFormProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create.kyc-investor-profile',
  );
  const questions = [
    t('questions.employment'),
    t('questions.brokerage-employment'),
    t('questions.income'),
    t('questions.net-worth'),
    t('questions.investment-goals'),
    t('questions.risk-tolerance'),
    t('questions.declarations'),
  ];

  return (
    <AnimatedContainer isExpanded={isExpanded}>
      <QuestionsContainer>
        {questions.map(question => (
          <Question key={question}>{question}</Question>
        ))}
      </QuestionsContainer>
    </AnimatedContainer>
  );
};

const QuestionsContainer = styled.ul`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    margin-left: ${theme.spacing[7]};
    padding: ${theme.spacing[4]};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    gap: ${theme.spacing[2]};
  `}
`;

const Question = styled.li`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.primary};
    list-style-type: disc;
    list-style-position: outside;
    margin-left: ${theme.spacing[5]}};
  `}
`;

export default InvestorProfileForm;
