import { useTranslation } from '@onefootprint/hooks';
import {
  IcoDownload16,
  IcoFileText16,
  IcoWarning16,
  IcoWriting16,
} from '@onefootprint/icons';
import type {
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
import type { WorkflowStartedEventData } from '@onefootprint/types/src/data/timeline';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import type { TimelineItem } from 'src/components/timeline';
import Timeline from 'src/components/timeline';

import {
  AbandonedEventBody,
  AbandonedEventHeader,
} from './components/abandoned-event';
import Actor from './components/actor';
import AnnotationNote from './components/annotation-note';
import {
  DataCollectedEventHeader,
  DataCollectedEventIcon,
} from './components/data-collected-event';
import {
  IdDocUploadedEventHeader,
  IdDocUploadedEventIcon,
} from './components/id-doc-uploaded-event';
import {
  LivenessEventBody,
  LivenessEventHeader,
  LivenessEventIcon,
} from './components/liveness-event';
import {
  OnboardingDecisionEventBody,
  OnboardingDecisionEventHeader,
  OnboardingDecisionEventIcon,
} from './components/onboarding-decision-event';
import {
  WatchlistCheckEventBody,
  WatchlistCheckEventHeader,
  WatchlistCheckEventIcon,
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
  const { t } = useTranslation('pages.entity.audit-trail');
  const mergedTimeline = mergeAuditTrailTimelineEvents(timeline);

  const items: TimelineItem[] = [];
  if (entity.status === EntityStatus.incomplete) {
    // Prepend a custom timeline item for incomplete users with no timestamp
    items.push({
      iconComponent: <IcoWarning16 />,
      headerComponent: <AbandonedEventHeader entity={entity} />,
      bodyComponent: <AbandonedEventBody />,
    });
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
        iconComponent: <LivenessEventIcon data={eventData} />,
        headerComponent: <LivenessEventHeader data={eventData} />,
        bodyComponent: <LivenessEventBody data={eventData} />,
      });
    } else if (kind === TimelineEventKind.dataCollected) {
      const eventData = data as CollectedDataEventData;
      if (eventData.attributes.length) {
        items.push({
          time,
          iconComponent: <DataCollectedEventIcon data={eventData} />,
          headerComponent: <DataCollectedEventHeader data={eventData} />,
        });
      }
    } else if (kind === TimelineEventKind.idDocUploaded) {
      const eventData = data as IdDocUploadedEventData;
      items.push({
        time,
        iconComponent: <IdDocUploadedEventIcon data={eventData} />,
        headerComponent: <IdDocUploadedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.onboardingDecision) {
      const eventData = data as OnboardingDecisionEventData;
      items.push({
        time,
        iconComponent: <OnboardingDecisionEventIcon data={eventData} />,
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
        iconComponent: <WatchlistCheckEventIcon />,
        headerComponent: <WatchlistCheckEventHeader data={eventData} />,
        bodyComponent: (
          <WatchlistCheckEventBody data={latestWatchlistEventData} />
        ),
      });
    } else if (kind === TimelineEventKind.freeFormNote) {
      const eventData = data as Annotation;
      items.push({
        time,
        iconComponent: <IcoFileText16 />,
        headerComponent: (
          <>
            <Typography variant="label-3">
              {t('timeline.free-form-note-event.note-added-by')}
            </Typography>
            &nbsp;
            <Actor actor={eventData.source} />
          </>
        ),
        bodyComponent: <AnnotationNote annotation={eventData} />,
      });
    } else if (kind === TimelineEventKind.vaultCreated) {
      const eventData = data as VaultCreatedEventData;
      items.push({
        time,
        iconComponent: <IcoDownload16 />,
        headerComponent: (
          <>
            <Typography variant="body-3">
              {t('timeline.vault-created-event.user-created-by')}
            </Typography>
            &nbsp;
            <Actor actor={eventData.actor} />
          </>
        ),
      });
    } else if (kind === TimelineEventKind.workflowTriggered) {
      const eventData = data as WorkflowTriggeredEventData;
      items.push({
        time,
        iconComponent: <IcoWriting16 />,
        headerComponent: <WorkflowTriggeredEventHeader data={eventData} />,
        bodyComponent: (
          <WorkflowTriggeredEventBody data={eventData} entityId={entity.id} />
        ),
      });
    } else if (kind === TimelineEventKind.workflowStarted) {
      const eventData = data as WorkflowStartedEventData;
      items.push({
        time,
        iconComponent: <IcoWriting16 />,
        headerComponent: <WorkflowStartedEventHeader data={eventData} />,
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
