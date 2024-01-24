import type { OnboardingDecisionEventData } from '@onefootprint/types';
import { ActorKind, DecisionStatus } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Actor from '../actor';
import Details from './components/details';

type OnboardingDecisionEventHeaderProps = {
  data: OnboardingDecisionEventData;
};

const OnboardingDecisionEventHeader = ({
  data,
}: OnboardingDecisionEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.onboarding-decision-event',
  });
  const {
    decision: { source, status },
  } = data;
  const isVerified = status === DecisionStatus.pass;
  const color = isVerified ? 'success' : 'error';

  // Text differs slightly based on whether Footprint or the tenant made the decision
  const isFootprintActor =
    source.kind === ActorKind.firmEmployee ||
    source.kind === ActorKind.footprint;
  let text;
  if (isFootprintActor) {
    text = isVerified ? t('verified-by') : t('could-not-be-verified-by');
  } else {
    const decision = t(`decision-status.${status}` as ParseKeys<'common'>);
    text = t('org-overwrite.title', { decision });
  }

  const showDetails = !isVerified && source.kind === ActorKind.footprint;

  return (
    <Stack direction="row" gap={2}>
      <Typography
        variant="label-3"
        color={color}
        testID="onboarding-decision-event-header"
      >
        {text}
        &nbsp;
        <Actor actor={source} />
      </Typography>
      {showDetails && <Details />}
    </Stack>
  );
};

export default OnboardingDecisionEventHeader;
