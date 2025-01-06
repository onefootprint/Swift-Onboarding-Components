import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import {
  getEntitiesByFpIdDataOptions,
  getEntitiesByFpIdOnboardingsByOnboardingIdRiskSignalsOptions,
} from '@onefootprint/axios/dashboard';
import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OnboardingBusinessInsight from './components/onboarding-business-insight';
import OnboardingRiskSignals from './components/onboarding-risk-signals';
import OnboardingRules from './components/onboarding-rules';
import OnboardingUserData from './components/onboarding-user-data';
import useSeqnoVault from './components/onboarding-user-data/hooks/use-seqno-vault';
import SidebarItem from './components/sidebar-item';
import useSubsections, { type Subsection } from './hooks/use-subsections';
import groupRiskSignals from './utils/group-risk-signals';

type OnboardingDataProps = {
  onboarding: EntityOnboarding;
};

const OnboardingData = ({ onboarding }: OnboardingDataProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings' });
  const entityId = useEntityId();
  const { data: riskSignals } = useQuery({
    ...getEntitiesByFpIdOnboardingsByOnboardingIdRiskSignalsOptions({
      path: { fpId: entityId, onboardingId: onboarding.id },
    }),
    enabled: Boolean(entityId) && Boolean(onboarding.id),
  });
  const { data: entityAttributes } = useQuery({
    ...getEntitiesByFpIdDataOptions({
      path: { fpId: entityId },
      query: { seqno: onboarding.seqno },
    }),
    enabled: Boolean(entityId),
  });
  const hasDecryptableDIs = Boolean(entityAttributes?.some(attr => attr.isDecryptable));
  const seqnoVault = useSeqnoVault(entityAttributes, onboarding.seqno?.toString());
  const subsections = useSubsections(onboarding);
  const subsectionKeys = Object.keys(subsections) as (keyof typeof subsections)[];
  const [selectedSubsection, setSelectedSubsection] = useState<Subsection>(subsectionKeys[0]);
  const isBusinessInsight = subsections[selectedSubsection]?.isBusinessInsight;

  useEffect(() => {
    setSelectedSubsection(subsectionKeys[0]);
  }, [riskSignals, onboarding.ruleSetResults]);

  if (Object.keys(subsections).length === 0) {
    return <p className="p-5 text-body-3">{t('empty')}</p>;
  }

  return (
    <div className="min-h-[500px] max-h-[500px] flex flex-1 overflow-hidden">
      <nav className="flex flex-col w-[200px] border-r border-solid border-tertiary py-4 px-2 flex-shrink-0">
        {Object.entries(subsections).map(([name, { title, iconComponent }]) => (
          <SidebarItem
            key={name}
            icon={iconComponent}
            isSelected={selectedSubsection === name}
            onClick={() => setSelectedSubsection(name as Subsection)}
            title={title}
          />
        ))}
      </nav>
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        {selectedSubsection === 'risk-signals' && (
          <OnboardingRiskSignals riskSignals={groupRiskSignals(riskSignals ?? [])} />
        )}
        {selectedSubsection === 'rules' && <OnboardingRules ruleSetResults={onboarding.ruleSetResults} />}
        {selectedSubsection === 'user-data' && (
          <OnboardingUserData canDecrypt={hasDecryptableDIs} onboardingId={onboarding.id} vault={seqnoVault} />
        )}
        {isBusinessInsight && (
          <OnboardingBusinessInsight
            canDecrypt={hasDecryptableDIs}
            isDecrypted={seqnoVault.isAllDecrypted}
            selectedSubsection={selectedSubsection}
            title={subsections[selectedSubsection]?.title ?? ''}
            onboardingId={onboarding.id}
            vault={seqnoVault}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingData;
