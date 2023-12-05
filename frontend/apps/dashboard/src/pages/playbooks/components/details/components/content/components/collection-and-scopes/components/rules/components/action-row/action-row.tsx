import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { type Rule, RuleOp } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui/src/utils/mixins/mixins';
import React from 'react';

import OpBadge from '../op-badge';

export type ActionRowProps = {
  rule: Rule;
};

const ActionRow = ({ rule }: ActionRowProps) => {
  const { t } = useTranslation('pages.playbooks.details.rules.action-row');

  return (
    <RulesListItem>
      {`${t('if')} `}
      {rule.ruleExpression.map(({ field: reasonCode, op }, index) => (
        <React.Fragment key={reasonCode}>
          {index > 0 && ` ${t('and')} `}
          {op === RuleOp.notEq && <OpBadge isActive />}
          <Badge variant="info">{reasonCode}</Badge>
        </React.Fragment>
      ))}
    </RulesListItem>
  );
};
const RulesListItem = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    ${createFontStyles('body-4')}
    line-height: 240%;

    &:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default ActionRow;
