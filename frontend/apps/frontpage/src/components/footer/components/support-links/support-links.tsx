import {
  IcoLinkedin24,
  IcoTwitter24,
  ThemedLogoFpCompact,
} from '@onefootprint/icons';
import { media, Stack, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const SUPPORT_EMAIL_ADDRESS = 'support@onefootprint.com';

const currentYear = new Date().getFullYear();

const socialLinks = [
  { hrefKey: 'twitter.href', Icon: IcoTwitter24 },
  { hrefKey: 'linkedin.href', Icon: IcoLinkedin24 },
];

const SuportLinks = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.footer' });
  return (
    <LeftContainer align="center" justify="space-between" width="100%">
      <TopLeftLinks direction="column" gap={6} align="flex-start">
        <Link href="/">
          <ThemedLogoFpCompact color="secondary" />
        </Link>
        <Typography variant="body-3" color="tertiary">
          © {currentYear} {t('copyright')}
        </Typography>
        <Link href={`mailto:${SUPPORT_EMAIL_ADDRESS}`}>
          <Typography variant="body-3" color="tertiary">
            {SUPPORT_EMAIL_ADDRESS}
          </Typography>
        </Link>
        <Stack direction="row" gap={4}>
          {socialLinks.map(({ hrefKey, Icon }) => (
            <Link
              key={hrefKey}
              href={t(hrefKey as ParseKeys<'common'>)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon color="tertiary" />
            </Link>
          ))}
        </Stack>
        <Stack align="center" gap={4}>
          <Image
            src="/footer/soc-2-badge-vanta.svg"
            height={40}
            width={40}
            alt="Soc2 badge"
          />
          <Image src="/footer/PCI.png" height={45} width={45} alt="PCI badge" />
        </Stack>
      </TopLeftLinks>
    </LeftContainer>
  );
};

const TopLeftLinks = styled(Stack)`
  width: 100%;
  a {
    text-decoration: none;
  }

  ${media.greaterThan('lg')`
      width: 300px;
    `}
`;

const LeftContainer = styled(Stack)`
  ${media.greaterThan('lg')`
      width: 300px;
      flex-direction: column;
      align-items: flex-start;
    `};
`;

export default SuportLinks;
