import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedKycDataEventData,
  IdDocUploadedEventData,
  LivenessEventData,
  OnboardingDecisionEventData,
  Timeline as UserTimeline,
  TimelineEventKind,
} from '@onefootprint/types';
import { Shimmer, Typography } from '@onefootprint/ui';
import React from 'react';
import Timeline, { TimelineItem } from 'src/components/timeline';

import {
  IdDocUploadedEventHeader,
  IdDocUploadedEventIcon,
} from './components/id-doc-uploaded-event';
import {
  KycDataCollectedEventHeader,
  KycDataCollectedEventIcon,
} from './components/kyc-data-collected-event';
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
import mergeAuditTrailTimelineEvents, {
  AuditTrailTimelineEvent,
} from './utils/merge-audit-trail-timeline-events/merge-audit-trail-timeline-events';

export type AuditTrailTimelineProps = {
  timeline: UserTimeline;
  isLoading?: boolean;
};

const AuditTrailTimeline = ({
  timeline,
  isLoading,
}: AuditTrailTimelineProps) => {
  const { t } = useTranslation('pages.user-details.audit-trail');

  if (isLoading) {
    return (
      <Shimmer sx={{ height: '100px' }} testID="audit-trail-timeline-loading" />
    );
  }
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
    } else if (kind === TimelineEventKind.kycDataCollected) {
      const eventData = data as CollectedKycDataEventData;
      items.push({
        time,
        iconComponent: isFromOtherOrg ? undefined : (
          <KycDataCollectedEventIcon data={eventData} />
        ),
        headerComponent: (
          <KycDataCollectedEventHeader
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
    }
  });

  return items.length > 0 ? (
    <Timeline items={items} />
  ) : (
    <Typography variant="body-3">{t('empty')}</Typography>
  );
};

export default AuditTrailTimeline;
