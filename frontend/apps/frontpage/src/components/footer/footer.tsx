import { Container, Divider, Grid, Stack, Text, media } from '@onefootprint/ui';
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
        textKey: 'product.kyc',
        href: '/kyc',
      },
      {
        textKey: 'product.kyb',
        href: '/kyb',
      },
      {
        textKey: 'product.vaulting',
        href: '/vaulting',
      },
      {
        textKey: 'product.auth',
        href: '/auth',
      },
    ],
  },
  {
    title: 'industries.title',
    links: [
      {
        textKey: 'industries.real-estate',
        href: '/industries/real-estate',
      },
      {
        textKey: 'industries.auto',
        href: '/industries/auto',
      },
      {
        textKey: 'industries.fintech',
        href: '/industries/fintech',
      },
      {
        textKey: 'industries.financial-institutions',
        href: '/industries/financial-institutions',
      },
    ],
  },
  {
    title: 'company.title',
    links: [
      {
        textKey: 'company.about',
        href: '/company',
      },
      {
        textKey: 'company.blog',
        href: '/blog',
      },
      {
        textKey: 'company.investor-updates',
        href: '/investor-updates',
      },
      {
        textKey: 'company.media',
        href: '/media',
      },
      {
        textKey: 'company.customers',
        href: '/customers',
      },
    ],
  },
  {
    title: 'developers.title',
    links: [
      {
        textKey: 'developers.docs',
        href: 'https://docs.onefootprint.com',
      },
      {
        textKey: 'developers.status',
        href: 'https://status.onefootprint.com/',
      },
    ],
  },
  {
    title: 'resources.title',
    links: [
      {
        textKey: 'resources.terms-of-service',
        href: '/terms-of-service',
      },
      {
        textKey: 'resources.privacy-policy',
        href: '/privacy-policy',
      },
      {
        textKey: 'resources.supported-id-documents',
        href: '/supported-id-documents',
      },
      {
        textKey: 'resources.security-disclosure',
        href: '/security-disclosure',
      },
      {
        textKey: 'resources.idv-privacy',
        href: '/idv-privacy',
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
              <Text variant="label-3" tag="h4">
                {t(section.title as ParseKeys<'common'>)}
              </Text>
              {section.links.map(link => (
                <FooterLink key={link.textKey} text={t(link.textKey as ParseKeys<'common'>)} href={link.href} />
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
