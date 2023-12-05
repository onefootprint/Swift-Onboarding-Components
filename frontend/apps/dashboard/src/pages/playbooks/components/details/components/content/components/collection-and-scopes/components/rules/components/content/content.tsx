import { useTranslation } from '@onefootprint/hooks';
import type { Rule } from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types';
import { InlineAlert, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import ActionSection from '../action-section';

export type RulesProps = {
  hasRules: boolean;
  playbookKind: OnboardingConfigKind;
  actionRules: Record<string, Rule[]>;
};

const Rules = ({ hasRules, playbookKind, actionRules }: RulesProps) => {
  const { t } = useTranslation('pages.playbooks.details.rules');

  return (
    <Stack direction="column" gap={7}>
      {playbookKind === OnboardingConfigKind.kyb && hasRules && (
        <InlineAlert variant="info">{t('alerts.kyb-alert')}</InlineAlert>
      )}
      {hasRules ? (
        Object.keys(actionRules).map(action => (
          <ActionSection
            key={action}
            name={action}
            rules={actionRules[action]}
          />
        ))
      ) : (
        <Typography variant="body-3">{t('empty-rules')}</Typography>
      )}
    </Stack>
  );
};

export default Rules;
