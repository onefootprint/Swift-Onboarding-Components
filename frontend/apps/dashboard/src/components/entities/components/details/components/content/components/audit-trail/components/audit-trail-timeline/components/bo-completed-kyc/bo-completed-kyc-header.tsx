import { ActorKind, DecisionStatus } from '@onefootprint/types';
import type { BoCompletedKycEventData } from '@onefootprint/types/src/data/timeline';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import { Trans, useTranslation } from 'react-i18next';
import Actor from '../actor';

type BoCompletedKycHeaderProps = {
  data: BoCompletedKycEventData;
};

const BoCompletedKycHeader = ({ data }: BoCompletedKycHeaderProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'audit-trail.timeline' });
  const {
    fpId,
    decision: { status, workflowKind, source },
  } = data;

  if (workflowKind === 'document') {
    return null;
  }

  const statusToText: Record<DecisionStatus, string> = {
    [DecisionStatus.fail]: t('onboarding-decision-event.decision-status.fail'),
    [DecisionStatus.pass]: t('onboarding-decision-event.decision-status.pass'),
    [DecisionStatus.none]: t('onboarding-decision-event.decision-status.none'),
    // We don't expect to receive an OBD with status stepUp in prod
    [DecisionStatus.stepUp]: t('onboarding-decision-event.decision-status.step_up'),
  };
  const outcome = t('onboarding-decision-event.with-outcome', { status: statusToText[status] });

  const beneficialOwner = <LinkButton href={`/users/${fpId}`}>{t('bo-completed-kyc.beneficial-owner')}</LinkButton>;

  if (source.kind === ActorKind.footprint) {
    // User finished onboarding onto a playbook and we made an automated OBD
    return (
      <Stack direction="row" align="center" gap={2}>
        <Text variant="body-3" display="flex" gap={2} whiteSpace="nowrap">
          <Trans
            ns="entity-details"
            i18nKey="audit-trail.timeline.bo-completed-kyc.header"
            components={{ beneficialOwner }}
            values={{ outcome }}
          />
        </Text>
      </Stack>
    );
  }

  // Otherwise, manual review decision
  return (
    <Stack direction="row" align="center" gap={2}>
      <Text variant="body-3" display="flex" gap={2} whiteSpace="nowrap">
        <Trans
          ns="entity-details"
          i18nKey="audit-trail.timeline.bo-completed-kyc.manual-review-header"
          values={{ decision: statusToText[status] }}
          components={{
            actor: <Actor actor={source} />,
            beneficialOwner,
          }}
        />
      </Text>
    </Stack>
  );
};

export default BoCompletedKycHeader;
