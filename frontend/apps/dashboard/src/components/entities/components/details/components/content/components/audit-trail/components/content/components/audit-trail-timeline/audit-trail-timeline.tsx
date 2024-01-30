import type {
  ActorApiKey,
  Annotation,
  CollectedDataEventData,
  CombinedWatchlistChecksEvent,
  Entity,
  IdDocUploadedEventData,
  LivenessEventData,
  OnboardingDecisionEventData,
  PreviousWatchlistChecksEventData,
  Timeline as EntityTimeline,
  VaultCreatedEventData,
  WatchlistCheckEventData,
  WorkflowTriggeredEventData,
} from '@onefootprint/types';
import { EntityStatus, TimelineEventKind } from '@onefootprint/types';
import type {
  AuthMethodUpdatedData,
  LabelAddedEventData,
  WorkflowStartedEventData,
} from '@onefootprint/types/src/data/timeline';
import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TimelineItem } from 'src/components/timeline';
import Timeline from 'src/components/timeline';

import {
  AbandonedEventBody,
  AbandonedEventHeader,
} from './components/abandoned-event';
import Actor from './components/actor';
import AnnotationNote from './components/annotation-note';
import AuthMethodUpdatedEventHeader from './components/auth-method-updated-event';
import DataCollectedEventHeader from './components/data-collected-event';
import IdDocUploadedEventHeader from './components/id-doc-uploaded-event';
import LabelAddedEventHeader from './components/label-added-event';
import {
  LivenessEventBody,
  LivenessEventHeader,
} from './components/liveness-event';
import {
  OnboardingDecisionEventBody,
  OnboardingDecisionEventHeader,
} from './components/onboarding-decision-event';
import {
  WatchlistCheckEventBody,
  WatchlistCheckEventHeader,
} from './components/watchlist-check-event';
import WorkflowStartedEventHeader from './components/workflow-started-event';
import {
  WorkflowTriggeredEventBody,
  WorkflowTriggeredEventHeader,
} from './components/workflow-triggered-event';
import type { AuditTrailTimelineEvent } from './utils/merge-audit-trail-timeline-events';
import mergeAuditTrailTimelineEvents from './utils/merge-audit-trail-timeline-events';

export type AuditTrailTimelineProps = {
  timeline: EntityTimeline;
  entity: Entity;
};

const AuditTrailTimeline = ({ entity, timeline }: AuditTrailTimelineProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail',
  });
  const mergedTimeline = mergeAuditTrailTimelineEvents(timeline);

  const items: TimelineItem[] = [];
  if (entity.status === EntityStatus.incomplete) {
    // Prepend a custom timeline item for incomplete users
    if (mergedTimeline.length) {
      items.push({
        time: mergedTimeline[0].time,
        headerComponent: <AbandonedEventHeader entity={entity} />,
        bodyComponent: <AbandonedEventBody />,
      });
    } else {
      items.push({
        headerComponent: <AbandonedEventHeader entity={entity} />,
        bodyComponent: <AbandonedEventBody />,
      });
    }
  }
  mergedTimeline.forEach((event: AuditTrailTimelineEvent) => {
    const {
      event: { kind, data },
      time,
    } = event;

    if (kind === TimelineEventKind.liveness) {
      const eventData = data as LivenessEventData;
      items.push({
        time,
        headerComponent: <LivenessEventHeader data={eventData} />,
        bodyComponent: <LivenessEventBody data={eventData} />,
      });
    } else if (kind === TimelineEventKind.labelAdded) {
      const eventData = data as LabelAddedEventData;
      items.push({
        time,
        headerComponent: <LabelAddedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.dataCollected) {
      const eventData = data as CollectedDataEventData;
      if (eventData.attributes.length) {
        items.push({
          time,
          headerComponent: <DataCollectedEventHeader data={eventData} />,
        });
      }
    } else if (kind === TimelineEventKind.idDocUploaded) {
      const eventData = data as IdDocUploadedEventData;
      items.push({
        time,
        headerComponent: <IdDocUploadedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.onboardingDecision) {
      const eventData = data as OnboardingDecisionEventData;
      items.push({
        time,
        headerComponent: <OnboardingDecisionEventHeader data={eventData} />,
        bodyComponent: <OnboardingDecisionEventBody data={eventData} />,
      });
    } else if (kind === TimelineEventKind.combinedWatchlistChecks) {
      const eventData = data as PreviousWatchlistChecksEventData;
      const combinedWatchlistEvent =
        event.event as CombinedWatchlistChecksEvent;
      const latestWatchlistEventData = combinedWatchlistEvent
        .latestWatchlistEvent?.data as WatchlistCheckEventData;
      items.push({
        time,
        headerComponent: <WatchlistCheckEventHeader data={eventData} />,
        bodyComponent: (
          <WatchlistCheckEventBody data={latestWatchlistEventData} />
        ),
      });
    } else if (kind === TimelineEventKind.freeFormNote) {
      const eventData = data as Annotation;
      items.push({
        time,
        headerComponent: (
          <>
            <Typography variant="body-3" color="tertiary">
              {t('timeline.free-form-note-event.note-added-by')}
            </Typography>
            <Actor actor={eventData.source} />
          </>
        ),
        bodyComponent: <AnnotationNote annotation={eventData} />,
      });
    } else if (kind === TimelineEventKind.vaultCreated) {
      const eventData = data as VaultCreatedEventData;
      items.push({
        time,
        headerComponent: (
          <>
            <Typography variant="body-3" color="tertiary">
              {t('timeline.vault-created-event.user-created-by')}
            </Typography>
            <LinkButton href="/api-keys" size="compact">
              {(eventData.actor as ActorApiKey).name}
            </LinkButton>
          </>
        ),
      });
    } else if (kind === TimelineEventKind.workflowTriggered) {
      const eventData = data as WorkflowTriggeredEventData;
      items.push({
        time,
        headerComponent: <WorkflowTriggeredEventHeader data={eventData} />,
        bodyComponent: (
          <WorkflowTriggeredEventBody data={eventData} entityId={entity.id} />
        ),
      });
    } else if (kind === TimelineEventKind.workflowStarted) {
      const eventData = data as WorkflowStartedEventData;
      items.push({
        time,
        headerComponent: <WorkflowStartedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.authMethodUpdated) {
      const eventData = data as AuthMethodUpdatedData;
      items.push({
        time,
        headerComponent: <AuthMethodUpdatedEventHeader data={eventData} />,
      });
    }
  });

  return items.length > 0 ? (
    <Timeline items={items} />
  ) : (
    <Typography variant="body-3">{t('empty')}</Typography>
  );
};

export default AuditTrailTimeline;
