import { getOrgListsOptions } from '@onefootprint/axios/dashboard';
import type { RuleExpression } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import RuleChip from '../rule-chip';

export type RuleRowProps = {
  ruleExpression: RuleExpression;
};

const RuleRow = ({ ruleExpression }: RuleRowProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.rules.rule-row' });
  const { data: lists } = useQuery(getOrgListsOptions());

  return (
    <Stack align="center" gap={3} flexWrap="wrap">
      <Text variant="body-3">{t('if')}</Text>
      {ruleExpression.map((expression, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={`${index}-${expression.field}`}>
          {index > 0 && (
            <Text variant="body-3" paddingLeft={2} paddingRight={2}>
              {t('and')}
            </Text>
          )}
          <RuleChip ruleExpression={expression} lists={lists?.data} />
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default RuleRow;
