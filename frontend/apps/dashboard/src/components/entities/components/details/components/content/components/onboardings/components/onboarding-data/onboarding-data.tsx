import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { getEntitiesByFpIdOnboardingsByOnboardingIdRiskSignalsOptions } from '@onefootprint/axios/dashboard';
import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import OnboardingRiskSignals from './components/onboarding-risk-signals';
import OnboardingRules from './components/onboarding-rules';
import OnboardingUserData from './components/onboarding-user-data';
import SidebarItem from './components/sidebar-item';
import useSubsections, { type Subsection } from './hooks/use-subsections';
import groupRiskSignals from './utils/group-risk-signals';

type OnboardingDataProps = {
  onboarding: EntityOnboarding;
};

const OnboardingData = ({ onboarding }: OnboardingDataProps) => {
  const entityId = useEntityId();
  const { data: riskSignals } = useQuery({
    ...getEntitiesByFpIdOnboardingsByOnboardingIdRiskSignalsOptions({
      path: { fpId: entityId, onboardingId: onboarding.id },
    }),
    enabled: Boolean(entityId) && Boolean(onboarding.id),
  });
  const subsections = useSubsections(onboarding, riskSignals);
  const [selectedSubsection, setSelectedSubsection] = useState<Subsection>(Object.keys(subsections)[0] as Subsection);

  useEffect(() => {
    setSelectedSubsection(Object.keys(subsections)[0] as Subsection);
  }, [riskSignals, onboarding.ruleSetResults]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col gap-1 w-[200px] border-r border-solid border-tertiary py-5 px-3 flex-shrink-0">
        {Object.entries(subsections).map(([name, { title, iconComponent }]) => (
          <SidebarItem
            key={name}
            icon={iconComponent}
            isSelected={selectedSubsection === name}
            onClick={() => setSelectedSubsection(name as Subsection)}
            title={title}
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
