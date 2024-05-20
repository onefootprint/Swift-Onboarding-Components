import {
  IcoLinkedin24,
  IcoX24,
  ThemedLogoFpCompact,
} from '@onefootprint/icons';
import { Box, createFontStyles, media, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const SUPPORT_EMAIL_ADDRESS = 'support@onefootprint.com';

const currentYear = new Date().getFullYear();

const socialLinks = [
  { hrefKey: 'twitter.href', Icon: IcoX24 },
  { hrefKey: 'linkedin.href', Icon: IcoLinkedin24 },
];

const SuportLinks = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.footer' });

  return (
    <Container>
      <Link href="/">
        <ThemedLogoFpCompact color="secondary" />
      </Link>
      <Text variant="body-3" color="tertiary">
        © {currentYear} {t('copyright')}
      </Text>
      <SupportMail href={`mailto:${SUPPORT_EMAIL_ADDRESS}`}>
        {SUPPORT_EMAIL_ADDRESS}
      </SupportMail>
      <SocialLinks>
        {socialLinks.map(({ hrefKey, Icon }) => (
          <StyledIconLink
            key={hrefKey}
            href={t(hrefKey as ParseKeys<'common'>)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon color="tertiary" />
          </StyledIconLink>
        ))}
      </SocialLinks>
      <BadgesContainer>
        <Image
          src="/footer/soc-2-badge-vanta.svg"
          height={40}
          width={40}
          alt="Soc2 badge"
        />
        <Image src="/footer/PCI.png" height={45} width={45} alt="PCI badge" />
      </BadgesContainer>
    </Container>
  );
};

const Container = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};

    ${media.greaterThan('md')`
      gap: ${theme.spacing[3]};
    `}
  `}
`;

const SocialLinks = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: row;
    gap: ${theme.spacing[2]};
    padding-top: ${theme.spacing[3]};
    height: 100%;
  `}
`;

const SupportMail = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    text-decoration: none;
    color: ${theme.color.tertiary};
    &:hover {
      color: ${theme.color.primary};
    }
  `}
`;

const BadgesContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: row;
    gap: ${theme.spacing[4]};
    img {
      width: 32px;
      height: 32px;
    }
  `}
`;

const StyledIconLink = styled(Link)`
  ${({ theme }) => css`
    &:hover {
      svg {
        path {
          fill: ${theme.color.primary};
        }
      }
    }
  `}
`;

export default SuportLinks;
