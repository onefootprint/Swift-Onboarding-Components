import { getOrgListsOptions } from '@onefootprint/axios/dashboard';
import type { RuleExpression } from '@onefootprint/request-types/dashboard';
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
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-body-3">{t('if')}</span>
      {ruleExpression.map((expression, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={`${index}-${expression.field}`}>
          {index > 0 && <span className="text-body-3 px-1">{t('and')}</span>}
          <RuleChip ruleExpression={expression} lists={lists?.data} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default RuleRow;
