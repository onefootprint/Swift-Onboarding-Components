import {
  IcoLinkedin24,
  IcoTwitter24,
  ThemedLogoFpCompact,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, Divider, media, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';

import FooterLink from './components/footer-link';

const currentYear = new Date().getFullYear();

const productLinks = ['compare', 'pricing'];

const companyLinks = ['about', 'blog', 'investor-updates'];

const SUPPORT_EMAIL_ADDRESS = 'support@onefootprint.com';

const resourcesLinks = [
  'terms-of-service',
  'privacy-policy',
  'faq',
  'supported-id-documents',
  'security-disclosure',
  'idv-privacy',
];

const developerLinks = ['docs', 'status'];

const Footer = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.footer' });
  return (
    <>
      <Divider />
      <Container as="footer">
        <Inner>
          <LeftContainer>
            <TopLeftLinks>
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
              <Typography variant="body-3" color="tertiary">
                {t('phone-number')}
              </Typography>
              <Badges>
                <Image
                  src="/footer/soc-2-badge-vanta.svg"
                  height={40}
                  width={40}
                  alt="Soc2 badge"
                />
                <Image
                  src="/footer/PCI.png"
                  height={45}
                  width={45}
                  alt="PCI badge"
                />
              </Badges>
            </TopLeftLinks>
            <SocialLogosContainer>
              <Link
                href={t('twitter.href')}
                rel="noopener noreferrer"
                target="_blank"
              >
                <IcoTwitter24 color="tertiary" />
              </Link>
              <Link
                href={t('linkedin.href')}
                rel="noopener noreferrer"
                target="_blank"
              >
                <IcoLinkedin24 color="tertiary" />
              </Link>
            </SocialLogosContainer>
          </LeftContainer>
          <LinksContainer>
            <SectionColumn>
              <Typography variant="label-3">
                {t('links.product.title')}
              </Typography>
              {productLinks.map(link => (
                <FooterLink
                  key={link}
                  text={t(`links.product.${link}.text` as ParseKeys<'common'>)}
                  href={t(`links.product.${link}.href` as ParseKeys<'common'>)}
                />
              ))}
            </SectionColumn>
            <SectionColumn>
              <Typography variant="label-3">
                {t('links.company.title')}
              </Typography>
              {companyLinks.map(link => (
                <FooterLink
                  key={link}
                  text={t(`links.company.${link}.text` as ParseKeys<'common'>)}
                  href={t(`links.company.${link}.href` as ParseKeys<'common'>)}
                />
              ))}
            </SectionColumn>
            <SectionColumn>
              <Typography variant="label-3">
                {t('links.developers.title')}
              </Typography>
              {developerLinks.map(link => (
                <FooterLink
                  key={link}
                  text={t(
                    `links.developers.${link}.text` as ParseKeys<'common'>,
                  )}
                  href={t(
                    `links.developers.${link}.href` as ParseKeys<'common'>,
                  )}
                />
              ))}
            </SectionColumn>
            <SectionColumn>
              <Typography variant="label-3">
                {t('links.resources.title')}
              </Typography>
              {resourcesLinks.map(link => (
                <FooterLink
                  key={link}
                  text={t(
                    `links.resources.${link}.text` as ParseKeys<'common'>,
                  )}
                  href={t(
                    `links.resources.${link}.href` as ParseKeys<'common'>,
                  )}
                />
              ))}
            </SectionColumn>
          </LinksContainer>
        </Inner>
      </Container>
    </>
  );
};

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-between;
    padding: ${theme.spacing[9]} 0 ${theme.spacing[9]} ${theme.spacing[4]};
    text-align: unset;
    flex-wrap: wrap;
    gap: ${theme.spacing[9]};

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[10]} 0 ${theme.spacing[10]} 0;
      flex-direction: row;
    `};
  `}
`;

const SectionColumn = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing[2]};
    min-width: 160px;
    gap: ${theme.spacing[6]};
  `}
`;

const LinksContainer = styled.nav`
  ${({ theme }) => css`
    max-width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: left;
    gap: ${theme.spacing[5]};
    flex-wrap: wrap;

    ${media.greaterThan('sm')`
      gap: ${theme.spacing[9]};
    `}
  `}
`;

const LeftContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  ${media.greaterThan('lg')`
      width: 300px;
      flex-direction: column;
      align-items: flex-start;
    `};
`;

const TopLeftLinks = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    align-items: flex-start;

    a {
      text-decoration: none;
    }

    ${media.greaterThan('lg')`
      width: 300px;
      gap: ${theme.spacing[5]};
      flex-direction: column;
    
    `}
  `}
`;

const SocialLogosContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
  `}
`;

const Badges = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing[4]};
  `}
`;

export default Footer;
