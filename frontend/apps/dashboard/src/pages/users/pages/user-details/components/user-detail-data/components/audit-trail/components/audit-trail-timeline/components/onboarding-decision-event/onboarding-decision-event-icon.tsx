import { IcoClose16, IcoFootprint16 } from '@onefootprint/icons';
import {
  OnboardingDecisionEvent,
  VerificationStatus,
} from '@onefootprint/types';
import React from 'react';

type OnboardingDecisionEventIconProps = {
  data: OnboardingDecisionEvent;
};

const OnboardingDecisionEventIcon = ({
  data,
}: OnboardingDecisionEventIconProps) => {
  const { verificationStatus } = data;

  if (verificationStatus === VerificationStatus.verified) {
    return <IcoFootprint16 />;
  }
  return <IcoClose16 />;
};

export default OnboardingDecisionEventIcon;
