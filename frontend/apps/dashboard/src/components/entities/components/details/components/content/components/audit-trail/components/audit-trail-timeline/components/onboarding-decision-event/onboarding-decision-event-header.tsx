import type { Theme } from '@onefootprint/design-tokens';
import type { OnboardingDecisionEventData } from '@onefootprint/types';
import { WorkflowKind } from '@onefootprint/types';
import { ActorKind, DecisionStatus } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { Trans, useTranslation } from 'react-i18next';

import Actor from '../actor';
import PlaybookLink from '../playbook-link';
import Details from './components/details';

type OnboardingDecisionEventHeaderProps = {
  data: OnboardingDecisionEventData;
};

const OnboardingDecisionEventHeader = ({ data }: OnboardingDecisionEventHeaderProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.onboarding-decision-event',
  });
  const {
    decision: { workflowKind, source, status, obConfiguration: playbook, ruleSetResultId, clearedManualReviews },
    workflowSource,
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

  if (source.kind === ActorKind.footprint && workflowKind === WorkflowKind.Document) {
    // The user just finishing onboarding onto a document Workflow.
    return (
      <Stack direction="row" align="center" gap={2}>
        <Stack align="center" testID="onboarding-decision-event-header">
          <Text variant="label-3" color={color}>
            {t('uploaded-docs')}
          </Text>
        </Stack>
      </Stack>
    );
  }

  // Text differs slightly based on whether Footprint or the tenant made the decision
  if (source.kind === ActorKind.footprint) {
    // User finished onboarding onto a playbook and we made an automated OBD
    let outcome = '';
    if (status === DecisionStatus.pass || status === DecisionStatus.fail) {
      outcome = t('with-outcome', { status: statusToText[status] });
    }
    let transKey = 'audit-trail.timeline.onboarding-decision-event.onboarded-onto';
    if (workflowSource === 'tenant') {
      transKey = 'audit-trail.timeline.onboarding-decision-event.ran-playbook';
    }
    return (
      <Stack direction="row" align="center" gap={2} flexWrap="wrap">
        <Stack align="center" testID="onboarding-decision-event-header">
          <Text variant="label-3" color={color} display="flex" gap={2} whiteSpace="nowrap">
            <Trans
              ns="entity-details"
              i18nKey={transKey}
              values={{ outcome }}
              components={{
                playbook: <PlaybookLink playbook={playbook} />,
              }}
            />
          </Text>
        </Stack>
        <Details onboardingDecision={data} ruleSetResultId={ruleSetResultId} />
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
              ns="entity-details"
              i18nKey="audit-trail.timeline.onboarding-decision-event.cleared-reviews.title"
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
            ns="entity-details"
            i18nKey="audit-trail.timeline.onboarding-decision-event.human-decision.title"
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
