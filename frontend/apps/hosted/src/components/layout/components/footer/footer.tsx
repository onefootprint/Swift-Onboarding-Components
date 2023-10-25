import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { SecuredByFootprint } from '@onefootprint/idv-elements';
import styled, { css } from '@onefootprint/styled';
import { media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

type Link = { label: string; href: string };

const Footer = () => {
  const { t } = useTranslation('components.layout.footer');
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;
  const tenantPk = onboardingConfig?.key;

  const links: Link[] = [
    {
      label: t('links.what-is-this'),
      href: tenantPk
        ? `${FRONTPAGE_BASE_URL}/tenant?ob-key=${tenantPk}`
        : FRONTPAGE_BASE_URL,
    },
    {
      label: t('links.privacy'),
      href: `${FRONTPAGE_BASE_URL}/privacy-policy`,
    },
    {
      label: t('links.terms'),
      href: 'https://onefootprint.com/terms-of-service',
    },
  ];

  return (
    <Container>
      <SecuredByFootprint />
      <LinksContainer>
        {links.map(({ href, label }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noreferrer">
              <Typography variant="caption-1" color="secondary" as="span">
                {label}
              </Typography>
            </a>
          </li>
        ))}
        <li>
          <Image
            src="/footer/soc-2-badge.png"
            height={32}
            width={32}
            alt="Soc2 badge"
          />
        </li>
      </LinksContainer>
    </Container>
  );
};

const Container = styled.footer`
  ${({ theme }) => css`
    display: none;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 ${theme.spacing[5]};

    ${media.greaterThan('md')`
      display: flex;
      padding: 0 ${theme.spacing[11]};
    `}
  `};
`;

const LinksContainer = styled.ul`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;
    gap: ${theme.spacing[7]};

    a {
      text-decoration: none;
      color: ${theme.color.secondary};

      @media (hover: hover) {
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `}
`;

export default Footer;
