import type { Rule } from '@onefootprint/types';
import { OnboardingConfigKind, RuleAction } from '@onefootprint/types';
import { InlineAlert, Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ActionSection from '../action-section';

export type RulesProps = {
  hasRules: boolean;
  playbookKind: OnboardingConfigKind;
  playbookId: string;
  shouldAllowEditing: boolean;
  actionRules: Record<string, Rule[]>;
};

const Rules = ({
  hasRules,
  playbookKind,
  playbookId,
  shouldAllowEditing,
  actionRules,
}: RulesProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.rules',
  });

  return (
    <Stack direction="column" gap={7}>
      {playbookKind === OnboardingConfigKind.kyb && hasRules && (
        <InlineAlert variant="info">{t('alerts.kyb-alert')}</InlineAlert>
      )}
      {hasRules ? (
        Object.values(RuleAction).map(action => (
          <ActionSection
            key={action}
            shouldAllowEditing={shouldAllowEditing}
            playbookId={playbookId}
            action={action}
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
