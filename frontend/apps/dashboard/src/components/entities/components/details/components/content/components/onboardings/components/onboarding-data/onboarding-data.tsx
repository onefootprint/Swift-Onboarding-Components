import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { getEntitiesByFpIdOnboardingsByOnboardingIdRiskSignalsOptions } from '@onefootprint/axios/dashboard';
import { IcoShuffle16, IcoUserCircle16, IcoWarning16 } from '@onefootprint/icons';
import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OnboardingRiskSignals from './components/onboarding-risk-signals';
import OnboardingRules from './components/onboarding-rules';
import OnboardingUserData from './components/onboarding-user-data';
import SidebarItem from './components/sidebar-item';
import groupRiskSignals from './utils/group-risk-signals';

type OnboardingDataProps = {
  onboarding: EntityOnboarding;
};

type Subsection = 'risk-signals' | 'rules' | 'user-data';

const OnboardingData = ({ onboarding }: OnboardingDataProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings' });
  const entityId = useEntityId();
  const { data: riskSignals } = useQuery({
    ...getEntitiesByFpIdOnboardingsByOnboardingIdRiskSignalsOptions({
      path: { fpId: entityId, onboardingId: onboarding.id },
    }),
    enabled: Boolean(entityId) && Boolean(onboarding.id),
  });

  const subsections = {
    'risk-signals': {
      title: t('risk-signals.title'),
      iconComponent: IcoWarning16,
    },
    rules: {
      title: t('rules.title'),
      iconComponent: IcoShuffle16,
    },
    'user-data': {
      title: t('user-data.title'),
      iconComponent: IcoUserCircle16,
    },
  };
  const shownSubsections = Object.keys(subsections).filter(subsection => {
    if (subsection === 'risk-signals' && riskSignals) return true;
    if (subsection === 'rules' && onboarding.ruleSetResults.length > 0) return true;
    if (subsection === 'user-data') return true;
    return false;
  });
  const [selectedSubsection, setSelectedSubsection] = useState<Subsection>(shownSubsections[0] as Subsection);

  useEffect(() => {
    setSelectedSubsection(shownSubsections[0] as Subsection);
  }, [riskSignals, onboarding.ruleSetResults]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col gap-1 w-[200px] border-r border-solid border-tertiary py-5 px-3 flex-shrink-0">
        {shownSubsections.map(subsection => (
          <SidebarItem
            key={subsection}
            icon={subsections[subsection as Subsection].iconComponent}
            isSelected={selectedSubsection === subsection}
            onClick={() => setSelectedSubsection(subsection as Subsection)}
            title={subsections[subsection as Subsection].title}
          />
        ))}
      </div>
      <div className="p-6 flex flex-col gap-2 flex-1 overflow-y-auto">
        {selectedSubsection === 'risk-signals' && (
          <OnboardingRiskSignals riskSignals={groupRiskSignals(riskSignals ?? [])} />
        )}
        {selectedSubsection === 'rules' && <OnboardingRules ruleSetResultId={onboarding.ruleSetResults[0].id} />}
        {selectedSubsection === 'user-data' && (
          <OnboardingUserData onboardingId={onboarding.id} seqno={onboarding.seqno} />
        )}
      </div>
    </div>
  );
};

export default OnboardingData;
