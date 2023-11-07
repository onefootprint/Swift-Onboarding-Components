import type { Color } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfigKind, RuleName } from '@onefootprint/types';
import { InlineAlert, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import Section from './components/section';

export type RulesProps = {
  playbookKind: OnboardingConfigKind;
};

const Rules = ({ playbookKind }: RulesProps) => {
  const { t } = useTranslation('pages.playbooks.details.rules');
  const sections = [
    {
      value: 'fail',
      color: 'error',
      defaultRules: [
        [RuleName.IdNotLocated, RuleName.IdFlagged],
        [
          RuleName.SubjectDeceased,
          RuleName.AddressInputIsPoBox,
          RuleName.DobLocatedCoppaAlert,
          RuleName.MultipleRecordsFound,
        ],
        [
          RuleName.SubjectDeceased,
          RuleName.SsnPartiallyMatches,
          RuleName.SsnInputIsInvalid,
          RuleName.SsnLocatedIsInvalid,
          RuleName.SsnIssuedPriorToDob,
        ],
        [
          RuleName.DocumentNotVerified,
          RuleName.DocumentSelfieDoesNotMatch,
          RuleName.DocumentUploadFailed,
        ],
      ],
    },
    {
      value: 'fail-manual-review',
      color: 'warning',
      defaultRules: [
        [RuleName.SsnNotProvided],
        [
          RuleName.WatchlistHitOfac,
          RuleName.WatchlistHitNonSdn,
          RuleName.WatchlistHitPep,
          RuleName.AdverseMediaHit,
        ],
        [
          RuleName.DocumentTypeMismatch,
          RuleName.DocumentUnknownCountryCode,
          RuleName.DocumentCountryCodeMismatch,
        ],
      ],
    },
    {
      value: 'step-up',
      color: 'info',
      defaultRules: [
        [
          RuleName.AddressDoesNotMatch,
          RuleName.NameDoesNotMatch,
          RuleName.DobDoesNotMatch,
        ],
      ],
    },
    {
      value: 'pass-manual-review',
      color: 'success',
      defaultRules: [[RuleName.DocumentIsPermitOrProvisionalLicense]],
    },
  ];

  return (
    <Stack direction="column" gap={7}>
      {playbookKind === OnboardingConfigKind.kyb && (
        <InlineAlert variant="info">{t('alerts.kyb-alert')}</InlineAlert>
      )}
      <Typography variant="label-2">{t('title')}</Typography>
      {sections.map(({ value, color, defaultRules }) => (
        <Section
          ruleName={value}
          titleColor={color as Color}
          rules={defaultRules}
        />
      ))}
    </Stack>
  );
};

export default Rules;
