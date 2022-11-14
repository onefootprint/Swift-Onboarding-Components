import { useTranslation } from '@onefootprint/hooks';
import {
  DecisionSourceKind,
  DecisionStatus,
  OnboardingDecisionEventData,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import OrgOverwriteDetails from './components/org-overwrite-details';

type OnboardingDecisionEventHeaderProps = {
  data: OnboardingDecisionEventData;
};

const OnboardingDecisionEventHeader = ({
  data,
}: OnboardingDecisionEventHeaderProps) => {
  const { t } = useTranslation(
    'pages.user-details.audit-trail.timeline.onboarding-decision-event',
  );
  const { source, status } = data;
  const isVerified = status === DecisionStatus.pass;
  const color = isVerified ? 'success' : 'error';

  if (source.kind === DecisionSourceKind.footprint) {
    return (
      <Typography
        variant="label-3"
        color={color}
        testID="onboarding-decision-event-header"
      >
        {isVerified
          ? t('verified-by-footprint')
          : t('not-verified-by-footprint')}
      </Typography>
    );
  }

  if (source.kind === DecisionSourceKind.organization) {
    const decision = t(`decision-status.${status}`);

    return (
      <OrgDecisionContainer data-test-id="onboarding-decision-event-header">
        <Typography variant="label-3" color={color}>
          {t('org-overwrite.title', { decision, user: source.member.email })}
        </Typography>
        <Typography variant="label-3" sx={{ marginLeft: 2, marginRight: 2 }}>
          •
        </Typography>
        <OrgOverwriteDetails
          source={source}
          timestamp={data.timestamp}
          status={status}
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
