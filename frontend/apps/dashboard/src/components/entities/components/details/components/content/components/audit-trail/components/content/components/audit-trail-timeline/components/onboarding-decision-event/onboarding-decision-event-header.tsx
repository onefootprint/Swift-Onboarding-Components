import type { Theme } from '@onefootprint/design-tokens';
import type { OnboardingDecisionEventData } from '@onefootprint/types';
import { ActorKind, DecisionStatus } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

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
    decision: { source, status, obConfiguration: playbook, ruleSetResultId, clearedManualReviews },
  } = data;
  const statusToText: Record<DecisionStatus, string> = {
    [DecisionStatus.fail]: t('decision-status.fail'),
    [DecisionStatus.pass]: t('decision-status.pass'),
    [DecisionStatus.none]: t('decision-status.none'),
    // We don't expect to receive an OBD with status stepUp in prod
    [DecisionStatus.stepUp]: t('decision-status.step_up'),
  };
  const statusToColor: Record<DecisionStatus, keyof Theme['color']> = {
    [DecisionStatus.fail]: 'error',
    [DecisionStatus.pass]: 'success',
    [DecisionStatus.none]: 'neutral',
    // We don't expect to receive an OBD with status stepUp in prod
    [DecisionStatus.stepUp]: 'warning',
  };
  const color = statusToColor[status];

  // Text differs slightly based on whether Footprint or the tenant made the decision
  if (source.kind === ActorKind.footprint) {
    // User finished onboarding onto a playbook and we made an automated OBD
    let outcome = '';
    if (status === DecisionStatus.pass || status === DecisionStatus.fail) {
      outcome = t('with-outcome', { status: statusToText[status] });
    }
    return (
      <Stack direction="row" align="center" gap={2}>
        <Stack align="center" testID="onboarding-decision-event-header">
          <Text variant="label-3" color={color}>
            <Trans
              i18nKey="pages.entity.audit-trail.timeline.onboarding-decision-event.onboarded-onto"
              values={{ outcome }}
              components={{
                playbook: <PlaybookLink playbook={playbook} />,
              }}
            />
          </Text>
        </Stack>
        <Details ruleSetResultId={ruleSetResultId} />
      </Stack>
    );
  }

  // Otherwise, manual review decision
  if (status === DecisionStatus.none && clearedManualReviews?.length) {
    // Special copy for clearing manual review without a new status
    return (
      <Stack direction="row" align="center" gap={2}>
        <Stack align="center" testID="onboarding-decision-event-header">
          <Text variant="body-3" color="tertiary">
            <Trans
              i18nKey="pages.entity.audit-trail.timeline.onboarding-decision-event.cleared-reviews.title"
              components={{
                actor: <Actor actor={source} />,
              }}
            />
          </Text>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="row" align="center" gap={2}>
      <Stack align="center" testID="onboarding-decision-event-header">
        <Text variant="label-3" color={color}>
          <Trans
            i18nKey="pages.entity.audit-trail.timeline.onboarding-decision-event.human-decision.title"
            values={{ decision: statusToText[status] }}
            components={{
              actor: <Actor actor={source} />,
            }}
          />
        </Text>
      </Stack>
    </Stack>
  );
};

export default OnboardingDecisionEventHeader;
