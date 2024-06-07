import type { OnboardingDecisionEventData } from '@onefootprint/types';
import { ActorKind } from '@onefootprint/types';
import React from 'react';

import AnnotationNote from '../annotation-note';

type OnboardingDecisionEventBodyProps = {
  data: OnboardingDecisionEventData;
};

const OnboardingDecisionEventBody = ({ data }: OnboardingDecisionEventBodyProps) => {
  const {
    annotation,
    decision: { source },
  } = data;

  if (annotation && source.kind !== ActorKind.footprint) {
    return <AnnotationNote annotation={annotation} />;
  }
  return null;
};

export default OnboardingDecisionEventBody;
