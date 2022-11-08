import { useTranslation } from '@onefootprint/hooks';
import {
  BiometricRegisteredEvent,
  CollectedKycDataEvent,
  IdDocUploadedEvent,
  OnboardingDecisionEvent,
  Timeline as UserTimeline,
  TimelineEvent,
  TimelineEventKind,
} from '@onefootprint/types';
import { Shimmer, Typography } from '@onefootprint/ui';
import React from 'react';
import Timeline, { TimelineItem } from 'src/components/timeline';

import {
  BiometricRegisteredEventBody,
  BiometricRegisteredEventHeader,
  BiometricRegisteredEventIcon,
} from './components/biometric-registered-event';
import {
  IdDocUploadedEventHeader,
  IdDocUploadedEventIcon,
} from './components/id-doc-uploaded-event';
import {
  KycDataCollectedEventHeader,
  KycDataCollectedEventIcon,
} from './components/kyc-data-collected-event';
import {
  OnboardingDecisionEventBody,
  OnboardingDecisionEventHeader,
  OnboardingDecisionEventIcon,
} from './components/onboarding-decision-event';

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

  const items: TimelineItem[] = [];
  timeline.forEach((timelineEvent: TimelineEvent) => {
    const {
      event: { kind, data },
      timestamp,
    } = timelineEvent;
    if (kind === TimelineEventKind.biometricRegistered) {
      const eventData = data as BiometricRegisteredEvent;
      items.push({
        timestamp,
        iconComponent: <BiometricRegisteredEventIcon data={eventData} />,
        headerComponent: <BiometricRegisteredEventHeader />,
        bodyComponent: <BiometricRegisteredEventBody data={eventData} />,
      });
    } else if (kind === TimelineEventKind.kycDataCollected) {
      const eventData = data as CollectedKycDataEvent;
      items.push({
        timestamp,
        iconComponent: <KycDataCollectedEventIcon data={eventData} />,
        headerComponent: <KycDataCollectedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.idDocUploaded) {
      const eventData = data as IdDocUploadedEvent;
      items.push({
        timestamp,
        iconComponent: <IdDocUploadedEventIcon data={eventData} />,
        headerComponent: <IdDocUploadedEventHeader data={eventData} />,
      });
    } else if (kind === TimelineEventKind.onboardingDecision) {
      const eventData = data as OnboardingDecisionEvent;
      items.push({
        timestamp,
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
