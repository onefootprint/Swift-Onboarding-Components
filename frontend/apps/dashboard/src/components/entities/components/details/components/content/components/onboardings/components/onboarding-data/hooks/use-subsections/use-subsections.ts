import useCurrentEntityTimeline from '@/entities/components/details/hooks/use-current-entity-timeline';
import { useEntityContext } from '@/entities/components/details/hooks/use-entity-context';
import {
  IcoBuilding16,
  IcoEye16,
  IcoFileText16,
  IcoShuffle16,
  IcoStore16,
  IcoUserCircle16,
  IcoUsers16,
  IcoWarning16,
  type Icon,
} from '@onefootprint/icons';
import type { EntityOnboarding, RiskSignal } from '@onefootprint/request-types/dashboard';
import { DecisionStatus, TimelineEventKind, WorkflowKind } from '@onefootprint/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type Subsection =
  | 'risk-signals'
  | 'rules'
  | 'user-data'
  | 'business-details'
  | 'people'
  | 'registrations'
  | 'watchlist'
  | 'offices';
type SubsectionMap = Partial<Record<Subsection, { title: string; iconComponent: Icon; isBusinessInsight?: boolean }>>;

const useSubsections = (onboarding: EntityOnboarding, riskSignals: RiskSignal[] | undefined): SubsectionMap => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings' });
  const { kind: entityKind } = useEntityContext();
  const { data: timelineData } = useCurrentEntityTimeline();

  const commonSubsections: SubsectionMap = {
    'risk-signals': {
      title: t('risk-signals.title'),
      iconComponent: IcoWarning16,
    },
    rules: {
      title: t('rules.title'),
      iconComponent: IcoShuffle16,
    },
  };

  const personSubsections: SubsectionMap = {
    'user-data': {
      title: t('user-data.title'),
      iconComponent: IcoUserCircle16,
    },
  };

  const businessSubsections: SubsectionMap = {
    'business-details': {
      title: t('business-details.title'),
      iconComponent: IcoStore16,
      isBusinessInsight: true,
    },
    people: {
      title: t('people.title'),
      iconComponent: IcoUsers16,
      isBusinessInsight: true,
    },
    registrations: {
      title: t('registrations.title'),
      iconComponent: IcoFileText16,
      isBusinessInsight: true,
    },
    watchlist: {
      title: t('watchlist.title'),
      iconComponent: IcoEye16,
      isBusinessInsight: true,
    },
    offices: {
      title: t('offices.title'),
      iconComponent: IcoBuilding16,
      isBusinessInsight: true,
    },
  };

  const subsections: SubsectionMap = {
    ...commonSubsections,
    ...(entityKind === 'person' ? personSubsections : {}),
    ...(entityKind === 'business' ? businessSubsections : {}),
  };

  const hideBusinessInsights = useMemo(() => {
    if (!timelineData) return true;

    return !timelineData.some(({ event }) => {
      const isKybOnboardingDecision =
        event.kind === TimelineEventKind.onboardingDecision && event.data.decision.workflowKind === WorkflowKind.Kyb;
      if (!isKybOnboardingDecision) return false;

      const isOnboardingComplete = [DecisionStatus.pass, DecisionStatus.fail].includes(event.data.decision.status);
      return isOnboardingComplete;
    });
  }, [timelineData]);

  const shownSubsections = Object.fromEntries(
    Object.entries(subsections).filter(([subsection, options]) => {
      if (subsection === 'risk-signals') {
        return riskSignals && riskSignals?.length > 0;
      }
      if (subsection === 'rules') {
        return onboarding.ruleSetResults && onboarding.ruleSetResults.length > 0;
      }
      if (options.isBusinessInsight) {
        return hideBusinessInsights ? false : Boolean(onboarding.seqno);
      }
      return true;
    }),
  );

  return shownSubsections;
};

export default useSubsections;
