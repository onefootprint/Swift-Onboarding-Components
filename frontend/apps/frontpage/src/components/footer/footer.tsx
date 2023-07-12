import { useTranslation } from '@onefootprint/hooks';
import { IcoLinkedin24, IcoTwitter24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, Divider, media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import FooterLink from './components/footer-link';

const currentYear = new Date().getFullYear();

const Footer = () => {
  const { t } = useTranslation('components.footer');
  return (
    <>
      <Divider />
      <Container as="footer">
        <Inner>
          <LeftContainer>
            <TopLeftLinks>
              <Link href="/">
                <Image
                  src="/footer/logo-fp-compact.svg"
                  height={20}
                  width={97}
                  alt="Footprint logo"
                />
              </Link>
              <Typography variant="body-3" color="tertiary">
                © {currentYear} {t('copyright')}
              </Typography>
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
              <FooterLink
                text={t('links.product.compare.text')}
                href={t('links.product.compare.href')}
              />
              <FooterLink
                text={t('links.product.pricing.text')}
                href={t('links.product.pricing.href')}
              />
            </SectionColumn>
            <SectionColumn>
              <Typography variant="label-3">
                {t('links.company.title')}
              </Typography>
              <FooterLink
                text={t('links.company.about.text')}
                href={t('links.company.about.href')}
              />
              <FooterLink
                text={t('links.company.blog.text')}
                href={t('links.company.blog.href')}
              />
              <FooterLink
                text={t('links.company.investor-updates.text')}
                href={t('links.company.investor-updates.href')}
              />
              <FooterLink
                text={t('links.company.library.text')}
                href={t('links.company.library.href')}
              />
            </SectionColumn>
            <SectionColumn>
              <Typography variant="label-3">
                {t('links.developers.title')}
              </Typography>
              <FooterLink
                text={t('links.developers.docs.text')}
                href={t('links.developers.docs.href')}
                newWindow
              />
              <FooterLink
                text={t('links.developers.status.text')}
                href={t('links.developers.status.href')}
                newWindow
              />
            </SectionColumn>
            <SectionColumn>
              <Typography variant="label-3">
                {t('links.resources.title')}
              </Typography>
              <FooterLink
                text={t('links.resources.terms-of-service.text')}
                href={t('links.resources.terms-of-service.href')}
              />
              <FooterLink
                text={t('links.resources.privacy-policy.text')}
                href={t('links.resources.privacy-policy.href')}
              />
              <FooterLink
                text={t('links.resources.security-disclosure.text')}
                href={t('links.resources.security-disclosure.href')}
              />
              <FooterLink
                text={t('links.resources.faq.text')}
                href={t('links.resources.faq.href')}
              />
              <FooterLink
                text={t('links.resources.supported-id-documents.text')}
                href={t('links.resources.supported-id-documents.href')}
              />
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
