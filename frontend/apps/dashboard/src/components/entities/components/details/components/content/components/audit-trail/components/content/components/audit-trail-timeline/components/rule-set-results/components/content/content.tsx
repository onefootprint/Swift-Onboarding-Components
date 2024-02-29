import type { Color } from '@onefootprint/design-tokens';
import type { Rule } from '@onefootprint/types';
import { RuleAction, RuleActionSection } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { kebabCase } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import ActionResultSection from './components/action-result-section';

export type ContentProps = {
  obConfigurationId: string;
  ruleResults: Record<RuleAction, Record<string, Rule[]>>;
  actionTriggered: RuleAction;
};

const Content = ({
  obConfigurationId,
  ruleResults,
  actionTriggered,
}: ContentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.rule-set-results',
  });
  const isStepUpSubsection = [
    RuleAction.stepUpIdentity,
    RuleAction.stepUpPoA,
    RuleAction.stepUpIdentitySsn,
  ].includes(actionTriggered);
  const actionName = isStepUpSubsection
    ? 'step-up'
    : kebabCase(actionTriggered);

  return (
    <Stack direction="column" gap={8}>
      <ActionTriggered>
        <Text variant="body-3" color="tertiary">
          {t('onboarding-decision')}
        </Text>
        <Text
          variant="label-3"
          color={t(`${actionName}.color` as ParseKeys<'common'>) as Color}
        >
          {t(`${actionName}.title` as ParseKeys<'common'>)}
        </Text>
      </ActionTriggered>
      {Object.values(RuleActionSection).map(actionSection => (
        <ActionResultSection
          key={actionSection}
          obConfigurationId={obConfigurationId}
          actionSection={actionSection}
          data={ruleResults}
        />
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
