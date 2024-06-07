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

const OnboardingDecisionEventHeader = ({ data }: OnboardingDecisionEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.onboarding-decision-event',
  });
  const {
    decision: { source, status, obConfiguration: playbook, ruleSetResultId },
  } = data;
  const isVerified = status === DecisionStatus.pass;
  const color = isVerified ? 'success' : 'error';

  // Text differs slightly based on whether Footprint or the tenant made the decision
  const isFootprintActor = source.kind === ActorKind.firmEmployee || source.kind === ActorKind.footprint;
  let text;
  let link;
  if (isFootprintActor) {
    text = isVerified ? t('verified-by') : t('not-verified-by');
    link = <PlaybookLink playbook={playbook} />;
  } else {
    text = t('org-overwrite.title', {
      decision: t(`decision-status.${status}` as ParseKeys<'common'>),
    });
    link = <Actor actor={source} />;
  }

  return (
    <Stack direction="row" align="center" gap={2}>
      <Stack align="center" testID="onboarding-decision-event-header">
        <Text variant="label-3" color={color}>
          {text}
        </Text>
        &nbsp;
        {link}
      </Stack>
      {isFootprintActor && <Details ruleSetResultId={ruleSetResultId} />}
    </Stack>
  );
};

export default OnboardingDecisionEventHeader;
