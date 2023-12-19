import type { Color } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { Rule, RuleAction } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
import kebabCase from 'lodash/kebabCase';
import React from 'react';

import ActionRow from '../action-row';

export type ActionSectionProps = {
  playbookId: string;
  action: RuleAction;
  rules: Rule[];
};

const ActionSection = ({ playbookId, action, rules }: ActionSectionProps) => {
  const { t } = useTranslation(`pages.playbooks.details.rules.action-section`);
  const kebabName = kebabCase(action);

  return (
    <Stack
      direction="column"
      gap={2}
      role="group"
      aria-label={t(`${kebabName}.title`)}
    >
      <Stack align="center" justify="space-between">
        <div>
          <Typography
            variant="label-3"
            color={t(`${kebabName}.color`) as Color}
          >
            {t(`${kebabName}.title`)}
          </Typography>
          <Typography variant="body-3" color="secondary">
            {t(`${kebabName}.subtitle`)}
          </Typography>
        </div>
      </Stack>
      <RulesList>
        {rules.map(rule => (
          <ActionRow
            key={JSON.stringify(rule)}
            playbookId={playbookId}
            rule={rule}
          />
        ))}
      </RulesList>
    </Stack>
  );
};

const RulesList = styled.div`
  ${({ theme }) => css`
    margin: ${theme.spacing[4]} 0;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default ActionSection;
