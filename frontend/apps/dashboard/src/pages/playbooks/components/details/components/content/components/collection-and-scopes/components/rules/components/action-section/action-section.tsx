import type { Color } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { Rule, RuleAction } from '@onefootprint/types';
import { Button, Stack, Typography } from '@onefootprint/ui';
import kebabCase from 'lodash/kebabCase';
import React, { useState } from 'react';
import RulesActionRow from 'src/components/rules-action-row';

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
  const { t } = useTranslation(`pages.playbooks.details.rules.action-section`);
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
      aria-label={t(`${actionName}.title`)}
    >
      <Stack align="center" justify="space-between">
        <div>
          <Typography
            variant="label-3"
            color={t(`${actionName}.color`) as Color}
          >
            {t(`${actionName}.title`)}
          </Typography>
          <Typography variant="body-3" color="secondary">
            {t(`${actionName}.subtitle`)}
          </Typography>
        </div>
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
