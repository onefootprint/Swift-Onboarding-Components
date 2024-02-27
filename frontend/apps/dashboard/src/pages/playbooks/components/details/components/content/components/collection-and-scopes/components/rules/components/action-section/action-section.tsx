import type { Color } from '@onefootprint/design-tokens';
import { IcoFileText16 } from '@onefootprint/icons';
import type { Rule } from '@onefootprint/types';
import { RuleAction } from '@onefootprint/types';
import { Button, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import kebabCase from 'lodash/kebabCase';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RulesActionRow from 'src/components/rules-action-row';
import styled, { css } from 'styled-components';

import EmptyActionRow from '../empty-action-row';

export type ActionSectionProps = {
  shouldAllowEditing: boolean;
  playbookId: string;
  action: RuleAction;
  rules: Rule[];
};

const ActionSection = ({
  shouldAllowEditing,
  playbookId,
  action,
  rules,
}: ActionSectionProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: `pages.playbooks.details.rules.action-section`,
  });
  const [isAddingRule, setIsAddingRule] = useState(false);
  const isStepUpSubsection = [
    RuleAction.stepUpIdentity,
    RuleAction.stepUpPoA,
    RuleAction.stepUpIdentitySsn,
  ].includes(action);
  const showStepUpTitle = action === RuleAction.stepUpIdentitySsn;
  const actionName = showStepUpTitle ? 'step-up' : kebabCase(action);

  const handleStartAdd = () => {
    setIsAddingRule(true);
  };

  const handleEndAdd = () => {
    setIsAddingRule(false);
  };

  const actionTitle = (
    <Stack direction="column" gap={1} textAlign="left">
      <Text
        variant="label-3"
        color={t(`${actionName}.color` as ParseKeys<'common'>) as Color}
      >
        {t(`${actionName}.title` as ParseKeys<'common'>)}
      </Text>
      <Text variant="body-3" color="secondary">
        {t(`${actionName}.subtitle` as ParseKeys<'common'>)}
      </Text>
    </Stack>
  );

  const getRuleList = () => {
    const emptyRow = (
      <EmptyActionRow
        playbookId={playbookId}
        action={action}
        onClick={handleEndAdd}
      />
    );
    if (rules.length) {
      return (
        <>
          {rules.map(rule => (
            <RulesActionRow
              key={JSON.stringify(rule)}
              shouldAllowEditing={shouldAllowEditing}
              playbookId={playbookId}
              rule={rule}
            />
          ))}
          {isAddingRule && emptyRow}
        </>
      );
    }
    return isAddingRule ? (
      <EmptySection>{emptyRow}</EmptySection>
    ) : (
      <Text variant="body-4" color="tertiary">
        {t('empty-rules')}
      </Text>
    );
  };

  return (
    <Stack
      direction="column"
      gap={2}
      role="group"
      aria-label={t(`${kebabCase(actionName)}.title` as ParseKeys<'common'>)}
    >
      <Stack direction="column" gap={5}>
        {showStepUpTitle && actionTitle}
        <Stack align="center" justify="space-between">
          {isStepUpSubsection ? (
            <Stack align="center" gap={2}>
              <IcoFileText16 />
              <Text variant="label-4">{t('step-up.subsection-title')}</Text>
              <Text variant="body-4">
                {t(`step-up.${kebabCase(action)}` as ParseKeys<'common'>)}
              </Text>
            </Stack>
          ) : (
            actionTitle
          )}
          {shouldAllowEditing && (
            <Button
              size="small"
              variant="secondary"
              sx={{ minWidth: 'fit-content' }}
              disabled={isAddingRule}
              onClick={handleStartAdd}
            >
              {t('add-rule')}
            </Button>
          )}
        </Stack>
      </Stack>
      <RuleList data-is-empty={!rules.length}>{getRuleList()}</RuleList>
    </Stack>
  );
};

const RuleList = styled.div`
  ${({ theme }) => css`
    margin: ${theme.spacing[4]} 0;

    &[data-is-empty='false'] {
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      border-radius: ${theme.borderRadius.default};
    }
  `}
`;

const EmptySection = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default ActionSection;
