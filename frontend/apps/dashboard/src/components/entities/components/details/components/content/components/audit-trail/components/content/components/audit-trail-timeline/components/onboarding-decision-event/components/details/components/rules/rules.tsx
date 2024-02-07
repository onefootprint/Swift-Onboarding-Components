import type { Rule, RuleAction } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';

export type RulesProps = {
  data?: Record<
    string,
    | boolean
    | string
    | Partial<Record<RuleAction, Record<string, boolean | Rule[]>>>
    | null
  >;
  isLoading: boolean;
  errorMessage?: string;
};

const Rules = ({ data, isLoading, errorMessage }: RulesProps) => {
  const { t } = useTranslation('common', {
    keyPrefix:
      'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details.rules',
  });

  return (
    <Stack direction="column" gap={7}>
      <Typography variant="body-3">{t('description')}</Typography>
      {data && (
        <Content
          obConfigurationId={data.obConfigurationId as string}
          ruleResults={
            data.ruleResults as Record<
              RuleAction,
              Record<string, boolean | Rule[]>
            >
          }
        />
      )}
      {isLoading && <Loading />}
      {errorMessage && <Error errorMessage={errorMessage} />}
    </Stack>
  );
};

export default Rules;
