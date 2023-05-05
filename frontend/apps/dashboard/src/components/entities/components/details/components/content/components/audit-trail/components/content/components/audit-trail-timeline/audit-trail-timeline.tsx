import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText16, IcoWarning16 } from '@onefootprint/icons';
import {
  Annotation,
  CollectedDataEventData,
  Entity,
  EntityStatus,
  IdDocUploadedEventData,
  LivenessEventData,
  OnboardingDecisionEventData,
  Timeline as EntityTimeline,
  TimelineEventKind,
  WatchlistCheckEventData,
  WatchlistCheckStatus,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import Timeline, { TimelineItem } from 'src/components/timeline';

import {
  AbandonedEventBody,
  AbandonedEventHeader,
} from './components/abandoned-event';
import AnnotationNote from './components/annotation-note';
import {
  DataCollectedEventHeader,
  DataCollectedEventIcon,
} from './components/data-collected-event';
import {
  FreeFormNoteAddHeader,
  FreeFormNoteAddIcon,
} from './components/free-form-note-add';
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
} from './utils/merge-audit-trail-timeline-events/merge-audit-trail-timeline-events';

export type AuditTrailTimelineProps = {
  timeline: EntityTimeline;
  entity: Entity;
};

const AuditTrailTimeline = ({ entity, timeline }: AuditTrailTimelineProps) => {
  const { t } = useTranslation('pages.entity.audit-trail');
  const mergedTimeline = mergeAuditTrailTimelineEvents(timeline);

  const items: TimelineItem[] = [];
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
        iconComponent: isFromOtherOrg ? undefined : (
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
    } else if (kind === TimelineEventKind.watchlistCheck) {
      const eventData = data as WatchlistCheckEventData;
      if (
        eventData.status === WatchlistCheckStatus.pass ||
        eventData.status === WatchlistCheckStatus.fail
      ) {
        // TODO hack to only show pass/fail events for now
        // Very basic timeline event - will add more details in the future
        items.push({
          time,
          iconComponent: <WatchlistCheckEventIcon />,
          headerComponent: <WatchlistCheckEventHeader />,
          bodyComponent: <WatchlistCheckEventBody data={eventData} />,
        });
      }
    } else if (kind === TimelineEventKind.freeFormNote) {
      const eventData = data as Annotation;
      items.push({
        time,
        iconComponent: <IcoFileText16 />,
        headerComponent: (
          <Typography variant="label-3">{`${t(
            'timeline.free-form-note-event.note-added-by',
          )} ${eventData.source.member}`}</Typography>
        ),
        bodyComponent: <AnnotationNote annotation={eventData} />,
      });
    }
  });
  if (entity.status === EntityStatus.incomplete) {
    // Postpend a custom timeline item for incomplete users with no timestamp
    items.push({
      time: undefined,
      iconComponent: <IcoWarning16 />,
      headerComponent: <AbandonedEventHeader />,
      bodyComponent: <AbandonedEventBody />,
    });
  }

  items.push({
    iconComponent: <FreeFormNoteAddIcon />,
    headerComponent: <FreeFormNoteAddHeader />,
  });

  return items.length > 0 ? (
    <Timeline items={items} />
  ) : (
    <Typography variant="body-3">{t('empty')}</Typography>
  );
};

export default AuditTrailTimeline;
