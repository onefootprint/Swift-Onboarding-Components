import type { Color } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { Rule } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
import kebabCase from 'lodash/kebabCase';
import React from 'react';

import ActionRow from '../action-row';

export type ActionSectionProps = {
  name: string;
  rules: Rule[];
};

const ActionSection = ({ name, rules }: ActionSectionProps) => {
  const { t } = useTranslation(
    `pages.playbooks.details.rules.action-section.${kebabCase(name)}`,
  );

  return (
    <Stack direction="column" gap={2}>
      <Typography variant="label-3" color={t('color') as Color}>
        {t('title')}
      </Typography>
      <Typography variant="body-3" color="secondary">
        {t('subtitle')}
      </Typography>
      <RulesList>
        {rules.map(rule => (
          <ActionRow key={JSON.stringify(rule)} rule={rule} />
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
