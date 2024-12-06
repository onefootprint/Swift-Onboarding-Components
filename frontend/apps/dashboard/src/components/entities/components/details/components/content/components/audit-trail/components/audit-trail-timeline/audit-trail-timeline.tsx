import type { DataCollectedInfo } from '@onefootprint/request-types/dashboard';
import type {
  ActorApiKey,
  Annotation,
  CombinedWatchlistChecksEvent,
  DocumentUploadedEventData,
  Entity,
  ExternalIntegrationCalledData,
  LivenessEventData,
  OnboardingDecisionEventData,
  PreviousWatchlistChecksEventData,
  StepUpEventData,
  VaultCreatedEventData,
  WatchlistCheckEventData,
  WorkflowTriggeredEventData,
} from '@onefootprint/types';
import { EntityKind, TimelineEventKind } from '@onefootprint/types';
import type {
  AuthMethodUpdatedData,
  BoCompletedKycEventData,
  LabelAddedEventData,
  WorkflowStartedEventData,
} from '@onefootprint/types/src/data/timeline';
import { LinkButton, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import type { TimelineItem } from 'src/components/timeline';
import Timeline from 'src/components/timeline';
import type { AuditTrailTimelineEvent } from 'src/utils/merge-audit-trail-timeline-events';
import { AbandonedEventHeader } from './components/abandoned-event';
import Actor from './components/actor';
import AnnotationNote from './components/annotation-note';
import AuthMethodUpdatedEventHeader from './components/auth-method-updated-event';
import AwaitingBosEvent from './components/awaiting-bos-event';
import { BoCompletedKycHeader } from './components/bo-completed-kyc';
import DataCollectedEventHeader from './components/data-collected-event';
import getVisibleDis from './components/data-collected-event/utils';
import DocumentUploadedEventHeader from './components/document-uploaded-event';
import {
  ExternalIntegrationCalledEventBody,
  ExternalIntegrationCalledEventHeader,
} from './components/external-integration-called-event';
import LabelAddedEventHeader from './components/label-added-event';
import { LivenessEventBody, LivenessEventHeader } from './components/liveness-event';
import { OnboardingDecisionEventBody, OnboardingDecisionEventHeader } from './components/onboarding-decision-event';
import { StepUpEventBody, StepUpEventHeader } from './components/step-up-event';
import { WatchlistCheckEventBody, WatchlistCheckEventHeader } from './components/watchlist-check-event';
import WorkflowStartedEventHeader from './components/workflow-started-event';
import { WorkflowTriggeredEventBody, WorkflowTriggeredEventHeader } from './components/workflow-triggered-event';

export type AuditTrailTimelineProps = {
  timeline: AuditTrailTimelineEvent[];
  entity: Entity;
};

const AuditTrailTimeline = ({ entity, timeline }: AuditTrailTimelineProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'audit-trail' });

  const items: TimelineItem[] = [];
  timeline.forEach(event => {
    const {
      event: { kind, data },
      timestamp,
    } = event;
    if (kind === TimelineEventKind.abandoned) {
      items.push({
        timestamp: timeline.length ? timeline[0].timestamp : undefined,
        headerComponent: <AbandonedEventHeader entity={entity} />,
        bodyComponent: undefined,
      });
    } else if (kind === TimelineEventKind.awaitingBos) {
      items.push({
        timestamp: timeline.length ? timeline[0].timestamp : undefined,
        headerComponent: <AwaitingBosEvent fpId={entity.id} />,
        bodyComponent: undefined,
      });
    } else if (kind === TimelineEventKind.liveness) {
      const eventData = data as LivenessEventData;
      items.push({
        timestamp,
        headerComponent: <LivenessEventHeader data={eventData} />,
        bodyComponent: <LivenessEventBody data={eventData} />,
      });
    } else if (kind === TimelineEventKind.labelAdded) {
      const eventData = data as LabelAddedEventData;
      items.push({
        timestamp,
        headerComponent: <LabelAddedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.dataCollected) {
      const eventData = data as DataCollectedInfo;
      const { visibleDis, visibleAttributes } = getVisibleDis(eventData.targets || [], eventData.attributes);
      if (visibleAttributes.length || visibleDis.length) {
        items.push({
          timestamp,
          headerComponent: <DataCollectedEventHeader data={eventData} />,
        });
      }
    } else if (kind === TimelineEventKind.documentUploaded) {
      const eventData = data as DocumentUploadedEventData;
      items.push({
        timestamp,
        headerComponent: <DocumentUploadedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.onboardingDecision) {
      const eventData = data as OnboardingDecisionEventData;
      const shouldShowBody = eventData.annotation;
      items.push({
        timestamp,
        headerComponent: <OnboardingDecisionEventHeader data={eventData} />,
        bodyComponent: shouldShowBody && <OnboardingDecisionEventBody data={eventData} />,
      });
    } else if (kind === TimelineEventKind.combinedWatchlistChecks) {
      const eventData = data as PreviousWatchlistChecksEventData;
      const combinedWatchlistEvent = event.event as CombinedWatchlistChecksEvent;
      const latestWatchlistEventData = combinedWatchlistEvent.latestWatchlistEvent?.data as WatchlistCheckEventData;
      items.push({
        timestamp,
        headerComponent: <WatchlistCheckEventHeader data={eventData} />,
        bodyComponent: <WatchlistCheckEventBody data={latestWatchlistEventData} />,
      });
    } else if (kind === TimelineEventKind.freeFormNote) {
      const eventData = data as Annotation;
      items.push({
        timestamp,
        headerComponent: (
          <>
            <Text variant="body-3" color="tertiary">
              {t('timeline.free-form-note-event.note-added-by')}
            </Text>
            <Actor actor={eventData.source} />
          </>
        ),
        bodyComponent: <AnnotationNote annotation={eventData} />,
      });
    } else if (kind === TimelineEventKind.vaultCreated) {
      const eventData = data as VaultCreatedEventData;
      items.push({
        timestamp,
        headerComponent: (
          <>
            <Text variant="body-3" color="tertiary">
              {entity.kind === EntityKind.person
                ? t('timeline.vault-created-event.user-created-by')
                : t('timeline.vault-created-event.business-created-by')}
            </Text>
            <LinkButton href="/api-keys">{(eventData.actor as ActorApiKey).name}</LinkButton>
          </>
        ),
      });
    } else if (kind === TimelineEventKind.workflowTriggered) {
      const eventData = data as WorkflowTriggeredEventData;
      const shouldShowBody = eventData.requestIsActive;
      items.push({
        timestamp,
        headerComponent: <WorkflowTriggeredEventHeader data={eventData} />,
        bodyComponent: shouldShowBody && <WorkflowTriggeredEventBody data={eventData} entityId={entity.id} />,
      });
    } else if (kind === TimelineEventKind.workflowStarted) {
      const eventData = data as WorkflowStartedEventData;
      items.push({
        timestamp,
        headerComponent: <WorkflowStartedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.authMethodUpdated) {
      const eventData = data as AuthMethodUpdatedData;
      items.push({
        timestamp,
        headerComponent: <AuthMethodUpdatedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.externalIntegrationCalled) {
      const eventData = data as ExternalIntegrationCalledData;
      items.push({
        timestamp,
        headerComponent: <ExternalIntegrationCalledEventHeader data={eventData} />,
        bodyComponent: <ExternalIntegrationCalledEventBody data={eventData} />,
      });
    } else if (kind === TimelineEventKind.stepUp) {
      const eventData = data as StepUpEventData;
      items.push({
        timestamp,
        headerComponent: <StepUpEventHeader data={eventData} />,
        bodyComponent: <StepUpEventBody data={eventData} />,
      });
    } else if (kind === TimelineEventKind.businessOwnerCompletedKyc) {
      const eventData = data as BoCompletedKycEventData;
      if (eventData.decision.workflowKind !== 'document') {
        items.push({
          timestamp,
          headerComponent: <BoCompletedKycHeader data={eventData} />,
        });
      }
    }
  });

  return items.length > 0 ? <Timeline items={items} /> : <Text variant="body-3">{t('empty')}</Text>;
};

export default AuditTrailTimeline;
