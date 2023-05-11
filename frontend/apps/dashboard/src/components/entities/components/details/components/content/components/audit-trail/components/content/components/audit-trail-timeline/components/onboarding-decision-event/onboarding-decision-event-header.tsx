import { useTranslation } from '@onefootprint/hooks';
import {
  ActorKind,
  DecisionStatus,
  OnboardingDecisionEventData,
} from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import FieldValidationDetails from './components/field-validation-details';

type OnboardingDecisionEventHeaderProps = {
  data: OnboardingDecisionEventData;
};

const OnboardingDecisionEventHeader = ({
  data,
}: OnboardingDecisionEventHeaderProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event',
  );
  const {
    decision: { source, status },
  } = data;
  const isVerified = status === DecisionStatus.pass;
  const color = isVerified ? 'success' : 'error';

  if (source.kind === ActorKind.footprint) {
    return (
      <Box sx={{ gap: 2 }}>
        <Typography
          variant="label-3"
          color={color}
          testID="onboarding-decision-event-header"
        >
          {isVerified
            ? t('verified-by-footprint')
            : t('not-verified-by-footprint')}
        </Typography>
        {!isVerified && <FieldValidationDetails />}
      </Box>
    );
  }

  if (source.kind === ActorKind.firmEmployee) {
    return (
      <OrgDecisionContainer>
        <Typography
          variant="label-3"
          color={color}
          testID="onboarding-decision-event-header"
        >
          {isVerified
            ? t('verified-by-firm-employee')
            : t('not-verified-by-firm-employee')}
        </Typography>
      </OrgDecisionContainer>
    );
  }

  if (source.kind === ActorKind.organization) {
    const decision = t(`decision-status.${status}`);

    return (
      <OrgDecisionContainer data-test-id="onboarding-decision-event-header">
        <Typography variant="label-3" color={color}>
          {t('org-overwrite.title', { decision, user: source.member })}
        </Typography>
      </OrgDecisionContainer>
    );
  }

  return null;
};

const OrgDecisionContainer = styled.span`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

export default OnboardingDecisionEventHeader;
