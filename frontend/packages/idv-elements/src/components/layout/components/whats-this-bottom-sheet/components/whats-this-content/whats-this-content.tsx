import { IcoDatabase16, IcoShield16 } from '@onefootprint/icons';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

import FeatureCard from '../feature-card/feature-card';

const localTranslations = {
  label: 'What’s this?',
  title: 'We care about your PII data and privacy',
  subtitle:
    "That's why {{tenant}} has partnered with Footprint to achieve the highest security standards, so your personal information is always safe and secure.",
  footprintUrlLabel: 'More about Footprint',
  tenantUrlLabel: 'More about {{tenant}}',
  cards: [
    {
      cardTitle: 'Zero-trust by design',
      subtitle:
        "Our API ensures only the right parties can access the data they're allowed to see.",
      icon: IcoShield16,
    },
    {
      cardTitle: 'Secure enclave backed',
      subtitle:
        'Our advanced PII vaults use strong cryptography and are built on top of secure Nitro Enclaves.',
      icon: IcoDatabase16,
    },
  ],
};

export type WhatsThisContentProps = {
  config?: PublicOnboardingConfig;
};

const WhatsThisContent = ({ config }: WhatsThisContentProps) => (
  <Stack direction="column" gap={5}>
    <Stack direction="column" gap={2} textAlign="center" align="center">
      {config?.logoUrl && (
        <Stack
          align="center"
          borderRadius="full"
          overflow="hidden"
          width="48px"
          height="48px"
          marginBottom={4}
        >
          <Image
            src={config.logoUrl}
            alt={config?.name}
            width={48}
            height={48}
          />
        </Stack>
      )}
      <Typography variant="label-1">{localTranslations.title}</Typography>
      <Typography variant="body-3" color="secondary">
        {localTranslations.subtitle.replace(
          '{{tenant}}',
          config?.orgName ? config.orgName : 'this company',
        )}
      </Typography>
    </Stack>
    <Stack direction="column" gap={5}>
      {localTranslations.cards.map(({ cardTitle, subtitle, icon }) => (
        <FeatureCard title={cardTitle} subtitle={subtitle} icon={icon} />
      ))}
    </Stack>
  </Stack>
);

export default WhatsThisContent;
