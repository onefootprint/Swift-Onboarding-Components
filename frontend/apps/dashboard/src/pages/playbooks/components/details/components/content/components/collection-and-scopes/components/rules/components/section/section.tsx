import type { Color } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { RuleName } from '@onefootprint/types';
import { CodeInline, Stack, Typography } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui/src/utils/mixins/mixins';
import React from 'react';

export type SectionProps = {
  ruleName: string;
  titleColor: Color;
  rules: RuleName[][];
};

const Section = ({ ruleName, titleColor, rules }: SectionProps) => {
  const { t } = useTranslation(`pages.playbooks.details.rules.${ruleName}`);

  const formatRuleItem = (ruleNames: RuleName[]) => (
    <RulesListItem>
      {'IF '}
      {ruleNames.map((name, index) => (
        <React.Fragment key={name}>
          {index > 0 && ' OR '}
          <CodeInline disabled>{name}</CodeInline>
        </React.Fragment>
      ))}
    </RulesListItem>
  );

  return (
    <Stack direction="column" gap={2}>
      <Typography variant="label-3" color={titleColor}>
        {t('title')}
      </Typography>
      <Typography variant="body-3" color="secondary">
        {t('subtitle')}
      </Typography>
      <RulesList>{rules.map(ruleNames => formatRuleItem(ruleNames))}</RulesList>
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

const RulesListItem = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    ${createFontStyles('snippet-2', 'code')}
    line-height: 210%;

    &:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default Section;
