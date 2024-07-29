import type { L10n } from '@onefootprint/footprint-js';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Grid, InlineAlert, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Email from './components/email';
import Header from './components/header';
import Name from './components/name';
import OwnershipStake from './components/ownership-stake';
import Phone from './components/phone';

export type FieldsProps = {
  config?: PublicOnboardingConfig;
  hasBorder?: boolean;
  index: number;
  l10n?: L10n;
  onRemove: (index: number) => void;
  requiresMultiKyc?: boolean;
};

const Fields = ({ config, hasBorder, index, l10n, onRemove, requiresMultiKyc }: FieldsProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.beneficial-owners.form.fields' });

  return (
    <Grid.Container
      gap={4}
      padding={hasBorder ? 5 : 0}
      borderWidth={hasBorder ? 1 : 0}
      borderColor={hasBorder ? 'tertiary' : undefined}
      borderRadius={hasBorder ? 'default' : undefined}
      borderStyle={hasBorder ? 'solid' : undefined}
    >
      <Header shouldShowRemove={index > 0} onRemove={() => onRemove(index)} />
      {index === 0 && (
        <InlineAlert variant="info">
          <Text variant="body-2" color="info">
            {t('primary-bo-name-hint')}
          </Text>
        </InlineAlert>
      )}
      <Name index={index} />
      <Email index={index} requireMultiKyc={requiresMultiKyc} />
      <Phone index={index} config={config} locale={l10n?.locale} requireMultiKyc={requiresMultiKyc} />
      <OwnershipStake index={index} />
    </Grid.Container>
  );
};

export default Fields;
