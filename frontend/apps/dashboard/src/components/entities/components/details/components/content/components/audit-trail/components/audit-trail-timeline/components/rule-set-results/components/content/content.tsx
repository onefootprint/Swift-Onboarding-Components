import type { Color } from '@onefootprint/design-tokens';
import type { Rule } from '@onefootprint/types';
import { RuleAction, RuleActionSection } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import kebabCase from 'lodash/kebabCase';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import ActionResultSection from './components/action-result-section';

export type ContentProps = {
  ruleResults: Record<RuleAction, Record<string, Rule[]>>;
  actionTriggered: RuleAction;
};

const Content = ({ ruleResults, actionTriggered }: ContentProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.rule-set-results',
  });
  const isStepUpSubsection = [RuleAction.stepUpIdentity, RuleAction.stepUpPoA, RuleAction.stepUpIdentitySsn].includes(
    actionTriggered,
  );
  const actionName = isStepUpSubsection ? 'step-up' : kebabCase(actionTriggered);
  const textColors: Record<string, Color> = {
    fail: 'error',
    'step-up': 'info',
    'manual-review': 'warning',
    'pass-with-manual-review': 'success',
    pass: 'success',
  };

  return (
    <Stack direction="column" gap={8}>
      <ActionTriggered>
        <Text variant="body-3" color="tertiary">
          {t('onboarding-decision')}
        </Text>
        <Text variant="label-3" color={textColors[actionName]}>
          {t(`${actionName}.title` as ParseKeys<'common'>)}
        </Text>
      </ActionTriggered>
      {Object.values(RuleActionSection).map(actionSection => (
        <ActionResultSection key={actionSection} actionSection={actionSection} data={ruleResults} />
      ))}
    </Stack>
  );
};

const ActionTriggered = styled(Stack)`
  ${({ theme }) => css`
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default Content;
