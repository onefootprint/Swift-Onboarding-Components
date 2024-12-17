import type { Rule, RuleAction } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import RuleRow from '../rule-row';

type ContentProps = {
  ruleResults: Partial<Record<RuleAction, Rule[]>>;
  showTriggered: boolean;
};

const Content = ({ ruleResults, showTriggered }: ContentProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.rules' });

  const getRuleActionColor = (action: RuleAction) => {
    if (action === 'pass_with_manual_review') return 'success';
    if (action === 'manual_review') return 'warning';
    if (action === 'fail') return 'error';
    return 'info';
  };

  const getRuleActionText = (action: RuleAction) => {
    if (action === 'pass_with_manual_review') return t('action.pass-with-manual-review');
    if (action === 'manual_review') return t('action.manual-review');
    if (action === 'fail') return t('action.fail');
    if (action.includes('step_up')) return t('action.step-up');
  };

  const getStepUpActionText = (action: RuleAction) => {
    if (action === 'step_up.identity') return t('action.identity');
    if (action === 'step_up.proof_of_address') return t('action.proof-of-address');
    if (action === 'step_up.identity_proof_of_ssn') return t('action.identity-proof-of-ssn');
    if (action === 'step_up.identity_proof_of_ssn_proof_of_address')
      return t('action.identity-proof-of-ssn-proof-of-address');
  };

  const renderRuleAction = (action: RuleAction) => {
    const actionText = (
      <span className={`text-label-3 text-${getRuleActionColor(action)}`}>{getRuleActionText(action)}</span>
    );
    if (action.includes('step_up')) {
      return (
        <div className="flex gap-1 items-center">
          {actionText}
          <span className="text-label-3 text-secondary">{getStepUpActionText(action)}</span>
        </div>
      );
    }
    return actionText;
  };

  if (Object.keys(ruleResults).length === 0) {
    return <span className="text-body-3">{showTriggered ? t('no-triggered-rules') : t('no-not-triggered-rules')}</span>;
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(ruleResults).map(([action, rules]) => (
        <div className="flex flex-col gap-3">
          {renderRuleAction(action as RuleAction)}
          <div className="flex flex-col gap-2">
            {rules.map(({ ruleExpression }) => (
              <RuleRow ruleExpression={ruleExpression} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Content;
