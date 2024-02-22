import type { Color } from '@onefootprint/design-tokens';
import type { Rule, RuleAction } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { kebabCase } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import RulesActionRow from 'src/components/rules-action-row';
import styled, { css } from 'styled-components';

export type ActionResultSectionProps = {
  obConfigurationId: string;
  action: RuleAction;
  data: Record<string, boolean | Rule[]>;
};

const ActionResultSection = ({
  obConfigurationId,
  action,
  data,
}: ActionResultSectionProps) => {
  const { t } = useTranslation('common', {
    keyPrefix:
      'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details.rules',
  });
  const actionName = kebabCase(action);

  const getResultSection = (name: string) => {
    const triggeredName = t(kebabCase(name) as ParseKeys<'common'>);
    const rules = data[name] as Rule[];

    return (
      <Stack
        direction="column"
        gap={rules.length ? 5 : 3}
        role="group"
        aria-label={triggeredName}
      >
        <Typography variant="label-3">{triggeredName}</Typography>
        {rules.length ? (
          <RuleList>
            {rules.map(rule => (
              <RulesActionRow
                key={JSON.stringify(rule)}
                shouldAllowEditing={false}
                playbookId={obConfigurationId}
                rule={rule}
              />
            ))}
          </RuleList>
        ) : (
          <Typography variant="body-3" color="tertiary">
            {t('no-rules')}
          </Typography>
        )}
      </Stack>
    );
  };

  return (
    <Stack
      direction="column"
      gap={5}
      role="group"
      aria-label={t(`${actionName}.title` as ParseKeys<'common'>)}
    >
      <Typography
        variant="label-2"
        color={t(`${actionName}.color` as ParseKeys<'common'>) as Color}
      >
        {t(`${actionName}.title` as ParseKeys<'common'>)}
      </Typography>
      {getResultSection('triggered')}
      {getResultSection('notTriggered')}
    </Stack>
  );
};

const RuleList = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default ActionResultSection;
