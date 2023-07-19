import { useTranslation } from '@onefootprint/hooks';
import {
  IcoDownload16,
  IcoFileText16,
  IcoLayer0116,
  IcoWarning16,
  IcoWriting16,
} from '@onefootprint/icons';
import {
  Annotation,
  CollectedDataEventData,
  CombinedWatchlistChecksEvent,
  Entity,
  EntityStatus,
  IdDocUploadedEventData,
  LivenessEventData,
  OnboardingDecisionEventData,
  PreviousWatchlistChecksEventData,
  Timeline as EntityTimeline,
  TimelineEventKind,
  VaultCreatedEventData,
  WatchlistCheckEventData,
  WorkflowTriggeredEventData,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import Timeline, { TimelineItem } from 'src/components/timeline';

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
import mergeAuditTrailTimelineEvents, {
  AuditTrailTimelineEvent,
} from './utils/merge-audit-trail-timeline-events';

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
      headerComponent: <AbandonedEventHeader />,
      bodyComponent: <AbandonedEventBody />,
    });
  }
  mergedTimeline.forEach((event: AuditTrailTimelineEvent) => {
    const {
      event: { kind, data },
      time,
      isFromOtherOrg,
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
      items.push({
        time,
        iconComponent: isFromOtherOrg ? (
          <IcoLayer0116 />
        ) : (
          <DataCollectedEventIcon data={eventData} />
        ),
        headerComponent: (
          <DataCollectedEventHeader
            data={eventData}
            isFromOtherOrg={isFromOtherOrg}
          />
        ),
      });
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
      const workflowKind = eventData.workflow.kind;
      const action = t(
        `timeline.workflow-triggered-event.actions.${workflowKind}`,
      );
      items.push({
        time,
        iconComponent: <IcoWriting16 />,
        headerComponent: (
          <>
            <Actor actor={eventData.actor} />
            &nbsp;
            <Typography variant="body-3">
              {t('timeline.workflow-triggered-event.requested-user-to', {
                action,
              })}
            </Typography>
          </>
        ),
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
