import { Container, Divider, Grid, media, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import FooterLink from './components/footer-link';
import SupportLinks from './components/support-links';

const linkSections = [
  {
    title: 'product.title',
    links: [
      {
        name: 'kyc',
        textKey: 'product.kyc.text',
        hrefKey: 'product.kyc.href',
      },
      {
        name: 'kyb',
        textKey: 'product.kyb.text',
        hrefKey: 'product.kyb.href',
      },
      {
        name: 'vaulting',
        textKey: 'product.vaulting.text',
        hrefKey: 'product.vaulting.href',
      },
      {
        name: 'auth',
        textKey: 'product.auth.text',
        hrefKey: 'product.auth.href',
      },
    ],
  },
  {
    title: 'industries.title',
    links: [
      {
        name: 'real-estate',
        textKey: 'industries.real-estate.text',
        hrefKey: 'industries.real-estate.href',
      },
      {
        name: 'auto',
        textKey: 'industries.auto.text',
        hrefKey: 'industries.auto.href',
      },
      {
        name: 'fintech',
        textKey: 'industries.fintech.text',
        hrefKey: 'industries.fintech.href',
      },
      {
        name: 'baas',
        textKey: 'industries.baas.text',
        hrefKey: 'industries.baas.href',
      },
    ],
  },
  {
    title: 'company.title',
    links: [
      {
        name: 'about',
        textKey: 'company.about.text',
        hrefKey: 'company.about.href',
      },
      {
        name: 'blog',
        textKey: 'company.blog.text',
        hrefKey: 'company.blog.href',
      },
      {
        name: 'investor-updates',
        textKey: 'company.investor-updates.text',
        hrefKey: 'company.investor-updates.href',
      },
      {
        name: 'media',
        textKey: 'company.media.text',
        hrefKey: 'company.media.href',
      },
    ],
  },
  {
    title: 'developers.title',
    links: [
      {
        name: 'docs',
        textKey: 'developers.docs.text',
        hrefKey: 'developers.docs.href',
      },
      {
        name: 'status',
        textKey: 'developers.status.text',
        hrefKey: 'developers.status.href',
      },
    ],
  },
  {
    title: 'resources.title',
    links: [
      {
        name: 'terms-of-service',
        textKey: 'resources.terms-of-service.text',
        hrefKey: 'resources.terms-of-service.href',
      },
      {
        name: 'privacy-policy',
        textKey: 'resources.privacy-policy.text',
        hrefKey: 'resources.privacy-policy.href',
      },
      {
        name: 'faq',
        textKey: 'resources.faq.text',
        hrefKey: 'resources.faq.href',
      },
      {
        name: 'supported-id-documents',
        textKey: 'resources.supported-id-documents.text',
        hrefKey: 'resources.supported-id-documents.href',
      },
      {
        name: 'security-disclosure',
        textKey: 'resources.security-disclosure.text',
        hrefKey: 'resources.security-disclosure.href',
      },
      {
        name: 'idv-privacy',
        textKey: 'resources.idv-privacy.text',
        hrefKey: 'resources.idv-privacy.href',
      },
    ],
  },
];

const Footer = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.footer' });
  return (
    <>
      <Divider />
      <FooterContainer tag="footer" position="relative">
        <SupportLinks />
        <LinksContainer>
          {linkSections.map(section => (
            <SectionColumn key={section.title}>
              <Text variant="label-3">
                {t(section.title as ParseKeys<'common'>)}
              </Text>
              {section.links.map(link => (
                <FooterLink
                  key={link.name}
                  text={t(link.textKey as ParseKeys<'common'>)}
                  href={t(link.hrefKey as ParseKeys<'common'>)}
                />
              ))}
            </SectionColumn>
          ))}
        </LinksContainer>
      </FooterContainer>
    </>
  );
};

const FooterContainer = styled(Container)`
  ${({ theme }) => css`
    gap: ${theme.spacing[10]};
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
    padding-top: ${theme.spacing[10]};
    padding-bottom: ${theme.spacing[9]};

    ${media.greaterThan('lg')`
      flex-direction: row;
      justify-content: space-between;
      align-items: space-between;
    `};
  `}
`;

const LinksContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    grid-template-columns: repeat(2, 1fr);
    grid-row-gap: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      grid-template-columns: repeat(5, 1fr);
    `}
  `}
`;

const SectionColumn = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

export default Footer;
