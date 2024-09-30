import { IcoDollar16 } from '@onefootprint/icons';
import { type Entity, InvestorProfileDI } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import EditInvestorProfileField from '../../../edit-investor-profile-field';
import FieldSection from './components/field-section';

type InvestorProfileTabProps = {
  entity: Entity;
};

const InvestorProfileTab = ({ entity }: InvestorProfileTabProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.user.vault' });
  const title = t('investor-profile.title');

  return (
    <Container aria-label={title}>
      <Header>
        <Stack align="center" gap={3}>
          <IcoDollar16 />
          <Text variant="label-2" tag="h2">
            {title}
          </Text>
        </Stack>
      </Header>
      <Stack direction="column" gap={7} padding={5} flex={1}>
        <FieldSection title={t('investor-profile.employment-status.title')}>
          <EditInvestorProfileField di={InvestorProfileDI.employmentStatus} entity={entity} />
        </FieldSection>
        <FieldSection title={t('investor-profile.occupation.title')}>
          <EditInvestorProfileField di={InvestorProfileDI.occupation} entity={entity} />
          <EditInvestorProfileField di={InvestorProfileDI.employer} entity={entity} />
        </FieldSection>
        <FieldSection title={t('investor-profile.annual-income.title')}>
          <EditInvestorProfileField di={InvestorProfileDI.annualIncome} entity={entity} />
        </FieldSection>
        <FieldSection title={t('investor-profile.net-worth.title')}>
          <EditInvestorProfileField di={InvestorProfileDI.netWorth} entity={entity} />
        </FieldSection>
        <FieldSection title={t('investor-profile.funding-sources.title')}>
          <EditInvestorProfileField di={InvestorProfileDI.fundingSources} entity={entity} />
        </FieldSection>
        <FieldSection title={t('investor-profile.investment-goals.title')}>
          <EditInvestorProfileField di={InvestorProfileDI.investmentGoals} entity={entity} />
        </FieldSection>
        <FieldSection title={t('investor-profile.risk-tolerance.title')} excludeDivider>
          <EditInvestorProfileField di={InvestorProfileDI.riskTolerance} entity={entity} />
        </FieldSection>
      </Stack>
    </Container>
  );
};

const Container = styled.fieldset`
  ${({ theme }) => css`
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: space-between;
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

export default InvestorProfileTab;
