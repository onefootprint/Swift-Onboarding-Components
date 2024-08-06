import React from 'react';
import { useTranslation } from 'react-i18next';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';
import useCurrentEntityTimeline from '@/entity/hooks/use-current-entity-timeline';
import useEntityId from '@/entity/hooks/use-entity-id';
import {
  BusinessDI,
  DecisionStatus,
  EntityVault,
  OnboardingDecisionEvent,
  TimelineEventKind,
  WorkflowKind,
  isVaultDataDecrypted,
  isVaultDataEmpty,
} from '@onefootprint/types';
import Section from '../section';
import Content from './components/content';
import Decrypt from './components/decrypt';

export type BusinessInsightsProps = WithEntityProps;

const BusinessInsights = ({ entity }: BusinessInsightsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const entityId = useEntityId();
  const { data: vaultData } = useEntityVault(entityId, entity);
  const { data: timelineData } = useCurrentEntityTimeline();
  const canDecrypt = !!entity.decryptableAttributes.length;

  const isKybOnboardingComplete = (event: OnboardingDecisionEvent) => {
    return (
      event.data.decision.workflowKind === WorkflowKind.Kyb &&
      (event.data.decision.status === DecisionStatus.pass || event.data.decision.status === DecisionStatus.fail)
    );
  };

  const hasNoInsights = () => {
    if (!timelineData) return true;
    const events = timelineData.filter(({ event }) => {
      return (
        event.kind === TimelineEventKind.onboardingDecision && isKybOnboardingComplete(event as OnboardingDecisionEvent)
      );
    });
    return events.length === 0;
  };

  const hasDecryptedAll = (entityVault: EntityVault | undefined) => {
    if (!entityVault || !canDecrypt) return false;
    return Object.values(BusinessDI).every(di => {
      const value = entityVault?.[di];
      return isVaultDataEmpty(value) || isVaultDataDecrypted(value);
    });
  };

  if (hasNoInsights()) return null;

  return (
    <Section title={t('title')}>
      {hasDecryptedAll(vaultData?.vault) ? <Content /> : <Decrypt canDecrypt={canDecrypt} />}
    </Section>
  );
};

export default BusinessInsights;
