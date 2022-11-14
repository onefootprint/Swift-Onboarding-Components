import { IcoClose16, IcoFootprint16 } from '@onefootprint/icons';
import {
  DecisionStatus,
  OnboardingDecisionEventData,
} from '@onefootprint/types';
import React from 'react';

type OnboardingDecisionEventIconProps = {
  data: OnboardingDecisionEventData;
};

const OnboardingDecisionEventIcon = ({
  data,
}: OnboardingDecisionEventIconProps) => {
  const { status } = data;

  if (status === DecisionStatus.pass) {
    return <IcoFootprint16 />;
  }
  return <IcoClose16 />;
};

export default OnboardingDecisionEventIcon;
