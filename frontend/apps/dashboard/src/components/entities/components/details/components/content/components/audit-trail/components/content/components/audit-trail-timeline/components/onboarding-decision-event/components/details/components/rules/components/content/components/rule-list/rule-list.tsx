import { IcoFileText16 } from '@onefootprint/icons';
import type { Rule, RuleAction } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { kebabCase } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import RulesActionRow from 'src/components/rules-action-row';
import styled, { css } from 'styled-components';

export type RuleListProps = {
  obConfigurationId: string;
  rules: Rule[];
  stepUpAction?: RuleAction;
};

const RuleList = ({
  obConfigurationId,
  rules,
  stepUpAction,
}: RuleListProps) => {
  const { t } = useTranslation('common', {
    keyPrefix:
      'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details.rules',
  });
  const actionName = kebabCase(stepUpAction);

  return (
    <Stack
      direction="column"
      gap={5}
      role="group"
      aria-label={t(`step-up.${actionName}` as ParseKeys<'common'>)}
    >
      {stepUpAction && (
        <Stack align="center" gap={2}>
          <IcoFileText16 />
          <Text variant="label-4">{t('step-up.subsection-title')}</Text>
          <Text variant="body-4">
            {t(`step-up.${actionName}` as ParseKeys<'common'>)}
          </Text>
        </Stack>
      )}
      {rules.length ? (
        <List>
          {rules.map(rule => (
            <RulesActionRow
              key={JSON.stringify(rule)}
              shouldAllowEditing={false}
              playbookId={obConfigurationId}
              rule={rule}
            />
          ))}
        </List>
      ) : (
        <Text variant="body-3" color="tertiary">
          {t('no-rules')}
        </Text>
      )}
    </Stack>
  );
};

const List = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default RuleList;
