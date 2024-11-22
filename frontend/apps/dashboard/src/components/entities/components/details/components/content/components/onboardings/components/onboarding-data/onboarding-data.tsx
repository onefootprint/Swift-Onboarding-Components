import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { getEntitiesByFpIdOnboardingsByOnboardingIdRiskSignalsOptions } from '@onefootprint/axios/dashboard';
import { IcoShuffle16, IcoUserCircle16, IcoWarning16 } from '@onefootprint/icons';
import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { Box, Text } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Subsection from '../subsection';
import OnboardingRiskSignals from './components/onboarding-risk-signals';
import OnboardingRules from './components/onboarding-rules';
import groupRiskSignals from './utils/group-risk-signals';

type OnboardingDataProps = {
  onboarding: EntityOnboarding;
};

const OnboardingData = ({ onboarding }: OnboardingDataProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings',
  });
  const entityId = useEntityId();
  const { data: riskSignals } = useQuery(
    getEntitiesByFpIdOnboardingsByOnboardingIdRiskSignalsOptions({
      path: { fpId: entityId, onboardingId: onboarding.id },
    }),
  );

  const subsections = {
    riskSignals: {
      title: t('risk-signals.title'),
      iconComponent: IcoWarning16,
    },
    rules: {
      title: t('rules.title'),
      iconComponent: IcoShuffle16,
    },
    userData: {
      title: t('user-data.title'),
      iconComponent: IcoUserCircle16,
    },
  };

  return (
    <Box paddingTop={4} paddingRight={6} paddingBottom={7} paddingLeft={6}>
      <TopSection>
        {riskSignals && (
          <Subsection icon={subsections.riskSignals.iconComponent} title={subsections.riskSignals.title}>
            <OnboardingRiskSignals riskSignals={groupRiskSignals(riskSignals)} />
          </Subsection>
        )}
        {onboarding.ruleSetResults.length > 0 && (
          <Subsection icon={subsections.rules.iconComponent} title={subsections.rules.title}>
            <OnboardingRules ruleSetResultId={onboarding.ruleSetResults[0].id} />
          </Subsection>
        )}
      </TopSection>
      <Box marginTop={8}>
        <Subsection icon={subsections.userData.iconComponent} title={subsections.userData.title}>
          <Text variant="label-3">Basic data</Text>
        </Subsection>
      </Box>
    </Box>
  );
};

const TopSection = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing[9]};

    & > *:only-child {
      grid-column: 1 / -1;
    }
  `};
`;

export default OnboardingData;
