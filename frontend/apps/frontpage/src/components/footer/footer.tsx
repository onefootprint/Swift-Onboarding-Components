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
        name: 'compare',
        textKey: 'product.compare.text',
        hrefKey: 'product.compare.href',
      },
      {
        name: 'pricing',
        textKey: 'product.pricing.text',
        hrefKey: 'product.pricing.href',
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
      <Container as="footer">
        <Inner
          direction="column-reverse"
          justify="space-between"
          paddingTop={10}
          paddingBottom={9}
        >
          <SupportLinks />
          <LinksContainer>
            {linkSections.map(section => (
              <Stack
                direction="column"
                align="start"
                gap={3}
                minWidth="160px"
                key={section.title}
              >
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
              </Stack>
            ))}
          </LinksContainer>
        </Inner>
      </Container>
    </>
  );
};

const Inner = styled(Stack)`
  ${({ theme }) => css`
    gap: ${theme.spacing[9]};

    ${media.greaterThan('lg')`
      flex-direction: row;
    `};
  `}
`;

const LinksContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    grid-template-columns: repeat(2, 1fr);
    grid-row-gap: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      grid-template-columns: repeat(4, 1fr);
    `}
  `}
`;

export default Footer;
