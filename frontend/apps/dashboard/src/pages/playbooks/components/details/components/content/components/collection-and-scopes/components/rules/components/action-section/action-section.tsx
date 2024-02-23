import type { Color } from '@onefootprint/design-tokens';
import type { Rule, RuleAction } from '@onefootprint/types';
import { Button, Stack, Typography } from '@onefootprint/ui';
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
  const actionName = kebabCase(action);

  const handleStartAdd = () => {
    setIsAddingRule(true);
  };

  const handleEndAdd = () => {
    setIsAddingRule(false);
  };

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
      <Typography variant="body-4" color="tertiary">
        {t('empty-rules')}
      </Typography>
    );
  };

  return (
    <Stack
      direction="column"
      gap={2}
      role="group"
      aria-label={t(`${actionName}.title` as ParseKeys<'common'>)}
    >
      <Stack align="center" justify="space-between">
        <Stack direction="column" gap={1} textAlign="left">
          <Typography
            variant="label-3"
            color={t(`${actionName}.color` as ParseKeys<'common'>) as Color}
          >
            {t(`${actionName}.title` as ParseKeys<'common'>)}
          </Typography>
          <Typography variant="body-3" color="secondary">
            {t(`${actionName}.subtitle` as ParseKeys<'common'>)}
          </Typography>
        </Stack>
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
