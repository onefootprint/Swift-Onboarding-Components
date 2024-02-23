import type { OnboardingDecisionEventData } from '@onefootprint/types';
import { ActorKind, DecisionStatus } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Actor from '../actor';
import PlaybookLink from '../playbook-link';
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
    decision: { source, status, obConfiguration: playbook, ruleSetResultId },
  } = data;
  const isVerified = status === DecisionStatus.pass;
  const color = isVerified ? 'success' : 'error';

  // Text differs slightly based on whether Footprint or the tenant made the decision
  const isFootprintActor =
    source.kind === ActorKind.firmEmployee ||
    source.kind === ActorKind.footprint;
  let text;
  if (isFootprintActor) {
    text = (
      <Stack align="center">
        {isVerified ? t('verified-by') : t('not-verified-by')}
        &nbsp;
        <PlaybookLink playbook={playbook} />
      </Stack>
    );
  } else {
    const decision = t(`decision-status.${status}` as ParseKeys<'common'>);
    text = (
      <Stack align="center">
        {t('org-overwrite.title', { decision })}
        &nbsp;
        <Actor actor={source} />
      </Stack>
    );
  }

  return (
    <Stack direction="row" align="center" gap={2}>
      <Text
        variant="label-3"
        color={color}
        testID="onboarding-decision-event-header"
      >
        {text}
      </Text>
      {isFootprintActor && <Details ruleSetResultId={ruleSetResultId} />}
    </Stack>
  );
};

export default OnboardingDecisionEventHeader;
