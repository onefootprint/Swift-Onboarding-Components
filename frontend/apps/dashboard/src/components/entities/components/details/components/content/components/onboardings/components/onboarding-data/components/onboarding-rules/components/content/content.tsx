import type { Rule, RuleAction } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type ContentProps = {
  ruleResults: Partial<Record<RuleAction, Rule[]>>;
  showTriggered: boolean;
};

const Content = ({ ruleResults, showTriggered }: ContentProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.rules.action',
  });

  const getRuleActionColor = (action: RuleAction) => {
    if (action === 'pass_with_manual_review') return 'success';
    if (action === 'manual_review') return 'warning';
    if (action === 'fail') return 'error';
    return 'info';
  };

  const getRuleActionText = (action: RuleAction) => {
    if (action === 'pass_with_manual_review') return t('pass-with-manual-review');
    if (action === 'manual_review') return t('manual-review');
    if (action === 'fail') return t('fail');
    if (action === 'step_up.identity') return t('step-up', { document: t('identity') });
    if (action === 'step_up.proof_of_address') return t('step-up', { document: t('proof-of-address') });
    if (action === 'step_up.identity_proof_of_ssn') return t('step-up', { document: t('identity-proof-of-ssn') });
    if (action === 'step_up.identity_proof_of_ssn_proof_of_address')
      return t('step-up', { document: t('identity-proof-of-ssn-proof-of-address') });
  };

  if (Object.keys(ruleResults).length === 0) {
    return <Text variant="body-3">{showTriggered ? t('no-triggered-rules') : t('no-not-triggered-rules')}</Text>;
  }

  return Object.entries(ruleResults).map(([action, rules]) => (
    <Stack direction="column" gap={4}>
      <Text variant="label-3" color={getRuleActionColor(action as RuleAction)}>
        {getRuleActionText(action as RuleAction)}
      </Text>
      <Stack direction="column" gap={3}>
        {rules.map(({ ruleExpression }) => (
          <Text variant="caption-1">{JSON.stringify(ruleExpression)}</Text>
        ))}
      </Stack>
    </Stack>
  ));
};

export default Content;
