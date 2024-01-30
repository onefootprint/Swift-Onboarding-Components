import type { OnboardingDecisionEventData } from '@onefootprint/types';
import { ActorKind, DecisionStatus } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import AnnotationNote from '../annotation-note';
import EventBodyEntry from '../event-body-entry';

type OnboardingDecisionEventBodyProps = {
  data: OnboardingDecisionEventData;
};

const OnboardingDecisionEventBody = ({
  data,
}: OnboardingDecisionEventBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.onboarding-decision-event',
  });
  const {
    annotation,
    decision: { source, status },
  } = data;

  if (annotation && source.kind !== ActorKind.footprint) {
    return <AnnotationNote annotation={annotation} />;
  }

  return status === DecisionStatus.stepUpRequired ? (
    <EventBodyEntry
      testID="onboarding-decision-event-body"
      content={t(`decision-status.${status}`)}
    />
  ) : null;
};

export default OnboardingDecisionEventBody;
