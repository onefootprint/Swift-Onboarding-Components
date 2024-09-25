import { IcoFileText16 } from '@onefootprint/icons';
import type { Rule, RuleAction } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import kebabCase from 'lodash/kebabCase';
import { useTranslation } from 'react-i18next';
import RulesActionRow from 'src/components/rules-action-row';
import styled, { css } from 'styled-components';

export type RuleListProps = {
  rules: Rule[];
  stepUpAction?: RuleAction;
};

const RuleList = ({ rules, stepUpAction }: RuleListProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.rule-set-results',
  });
  const actionName = kebabCase(stepUpAction);

  return (
    <Stack direction="column" gap={5} role="group" aria-label={t(`step-up.${actionName}` as ParseKeys<'common'>)}>
      {stepUpAction && (
        <Stack align="center" gap={3}>
          <IcoFileText16 />
          <Text variant="label-3">{t(`step-up.${actionName}` as ParseKeys<'common'>)}</Text>
        </Stack>
      )}
      {rules.length ? (
        <List>
          {rules.map(rule => (
            <RulesActionRow key={JSON.stringify(rule)} isEditing={false} rule={rule} />
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
