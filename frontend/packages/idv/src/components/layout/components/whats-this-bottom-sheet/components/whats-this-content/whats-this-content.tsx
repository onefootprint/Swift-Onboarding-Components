import { IcoDatabase16, IcoShield16 } from '@onefootprint/icons';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import FeatureCard from '../feature-card';

export type WhatsThisContentProps = {
  config?: PublicOnboardingConfig;
};

const WhatsThisContent = ({ config }: WhatsThisContentProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.layout.whats-this-drawer',
  });

  const tenantLabel = config?.orgName ?? t('this-company');
  const localTranslations = {
    label: t('label'),
    title: t('title'),
    subtitle: t('subtitle', { tenant: tenantLabel }),
    footprintUrlLabel: t('footprint-url-label'),
    tenantUrlLabel: t('tenant-url-label', { tenant: tenantLabel }),
    cards: [
      {
        cardTitle: t('cards.trust.title'),
        subtitle: t('cards.trust.subtitle'),
        icon: IcoShield16,
      },
      {
        cardTitle: t('cards.secure.title'),
        subtitle: t('cards.secure.subtitle'),
        icon: IcoDatabase16,
      },
    ],
  };

  return (
    <Stack direction="column" gap={5}>
      <Stack direction="column" gap={2} textAlign="center" align="center">
        {config?.logoUrl && (
          <Stack align="center" borderRadius="full" overflow="hidden" width="48px" height="48px" marginBottom={4}>
            <Image src={config.logoUrl} alt={config?.name} width={48} height={48} />
          </Stack>
        )}
        <Text variant="label-1">{localTranslations.title}</Text>
        <Text variant="body-3" color="secondary">
          {localTranslations.subtitle.replace('{{tenant}}', config?.orgName ? config.orgName : 'this company')}
        </Text>
      </Stack>
      <Stack direction="column" gap={5}>
        {localTranslations.cards.map(({ cardTitle, subtitle, icon }) => (
          <FeatureCard title={cardTitle} subtitle={subtitle} icon={icon} key={cardTitle} />
        ))}
      </Stack>
    </Stack>
  );
};

export default WhatsThisContent;
