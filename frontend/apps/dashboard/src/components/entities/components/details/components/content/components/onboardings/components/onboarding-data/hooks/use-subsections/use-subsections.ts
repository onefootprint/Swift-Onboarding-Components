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
import { useTranslation } from 'react-i18next';

export type Subsection =
  | 'risk-signals'
  | 'rules'
  | 'user-data'
  | 'business-details'
  | 'people'
  | 'sos-filings'
  | 'watchlists'
  | 'offices';
type SubsectionMap = Partial<Record<Subsection, { title: string; iconComponent: Icon; isBusinessInsight?: boolean }>>;

const useSubsections = (onboarding: EntityOnboarding, riskSignals: RiskSignal[] | undefined): SubsectionMap => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings' });
  const { kind: entityKind } = useEntityContext();

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
    'sos-filings': {
      title: t('sos-filings.title'),
      iconComponent: IcoFileText16,
      isBusinessInsight: true,
    },
    watchlists: {
      title: t('watchlists.title'),
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

  const shownSubsections = Object.fromEntries(
    Object.entries(subsections).filter(([subsection]) => {
      if (subsection === 'risk-signals') {
        return riskSignals && riskSignals?.length > 0;
      }
      if (subsection === 'rules') {
        return onboarding.ruleSetResults && onboarding.ruleSetResults.length > 0;
      }
      return true;
    }),
  );

  return shownSubsections;
};

export default useSubsections;
