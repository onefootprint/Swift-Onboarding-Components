import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import {
  getEntitiesByFpIdDataOptions,
  getEntitiesByFpIdOnboardingsByOnboardingIdRiskSignalsOptions,
} from '@onefootprint/axios/dashboard';
import { IcoShuffle16, IcoUserCircle16, IcoWarning16 } from '@onefootprint/icons';
import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { Box } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Subsection from '../subsection';
import Decrypt from './components/decrypt';
import OnboardingRiskSignals from './components/onboarding-risk-signals';
import OnboardingRules from './components/onboarding-rules';
import RulesDropdown from './components/onboarding-rules/components/rules-dropdown';
import OnboardingUserData from './components/onboarding-user-data';
import useSeqnoVault from './components/onboarding-user-data/hooks/use-seqno-vault';
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
  const { data: entityAttributes } = useQuery(
    getEntitiesByFpIdDataOptions({
      path: { fpId: entityId },
      query: { seqno: onboarding.seqno },
    }),
  );
  const {
    data: vaultData,
    update: updateVault,
    isAllDecrypted,
  } = useSeqnoVault(entityAttributes, onboarding.seqno?.toString());
  const [showTriggeredRules, setShowTriggeredRules] = useState(true);
  const hasDecryptableDIs = Boolean(entityAttributes?.some(attr => attr.isDecryptable));

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

  const handleRulesDropdownSelect = (isTriggered: boolean) => {
    setShowTriggeredRules(isTriggered);
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
          <Subsection
            icon={subsections.rules.iconComponent}
            title={subsections.rules.title}
            rightComponent={<RulesDropdown onClick={handleRulesDropdownSelect} />}
          >
            <OnboardingRules
              ruleSetResultId={onboarding.ruleSetResults[0].id}
              showTriggeredRules={showTriggeredRules}
            />
          </Subsection>
        )}
      </TopSection>
      <Box marginTop={8}>
        <Subsection
          icon={subsections.userData.iconComponent}
          title={subsections.userData.title}
          rightComponent={
            !isAllDecrypted && (
              <Decrypt
                canDecrypt={hasDecryptableDIs}
                onDecryptSuccess={updateVault}
                onboardingId={onboarding.id}
                vaultData={vaultData}
              />
            )
          }
        >
          <OnboardingUserData vaultData={vaultData} />
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
