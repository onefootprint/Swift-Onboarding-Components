import { useTranslation } from '@onefootprint/hooks';
import {
  DecisionSourceKind,
  OnboardingDecisionEvent,
  VerificationStatus,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import OrgOverwriteDetails from './components/org-overwrite-details';

type OnboardingDecisionEventHeaderProps = {
  data: OnboardingDecisionEvent;
};

const OnboardingDecisionEventHeader = ({
  data,
}: OnboardingDecisionEventHeaderProps) => {
  const { t } = useTranslation(
    'pages.user-details.audit-trail.timeline.onboarding-decision-event',
  );
  const { source, verificationStatus } = data;
  const isVerified = verificationStatus === VerificationStatus.verified;
  const color = isVerified ? 'success' : 'error';

  if (source.kind === DecisionSourceKind.footprint) {
    return (
      <Typography variant="label-3" color={color}>
        {isVerified
          ? t('verified-by-footprint')
          : t('not-verified-by-footprint')}
      </Typography>
    );
  }

  if (source.kind === DecisionSourceKind.organization) {
    const decision = t(`verification-status.${verificationStatus}`);

    return (
      <OrgDecisionContainer>
        <Typography variant="label-3" color={color}>
          {t('org-overwrite.title', { decision, user: source.member.email })}
        </Typography>
        <Typography variant="label-3" sx={{ marginLeft: 2, marginRight: 2 }}>
          •
        </Typography>
        <OrgOverwriteDetails
          source={source}
          timestamp={data.timestamp}
          verificationStatus={verificationStatus}
        />
      </OrgDecisionContainer>
    );
  }

  return null;
};

const OrgDecisionContainer = styled.span`
  display: flex;
  align-items: center;
`;

export default OnboardingDecisionEventHeader;
