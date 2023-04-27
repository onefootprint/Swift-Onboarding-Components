import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { media, Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import SecuredByFootprint from '../secured-by-footprint';
import FooterActions from './footer-actions';
import { Link } from './footer-actions/footer-actions';

const FootprintFooter = () => {
  const router = useRouter();
  const [shouldShowLinks, setShouldShowLinks] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    setShouldShowLinks(true);
  }, [router.isReady]);

  const links: Link[] = [
    {
      label: "What's this?",
      href: `${FRONTPAGE_BASE_URL}/tenant?ob-key=${
        router.query.public_key as string
      }`,
    },
    {
      label: 'Privacy',
      href: `${FRONTPAGE_BASE_URL}/privacy-policy`,
    },
  ];

  return (
    <FootprintFooterContainer>
      <SecuredByFootprint />
      {shouldShowLinks ? (
        <>
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
          </LinksContainer>
          <ActionsWrapper>
            <FooterActions links={links} />
          </ActionsWrapper>
        </>
      ) : null}
    </FootprintFooterContainer>
  );
};

const FootprintFooterContainer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    flex: 0;
    background-color: ${theme.backgroundColor.secondary};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const LinksContainer = styled.ul`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;
    gap: ${theme.spacing[2]};

    ${media.lessThan('sm')`
      display: none;
    `}

    li {
      &:not(:last-child) {
        &:after {
          content: '·';
          margin: 0 ${theme.spacing[2]};
        }
      }
    }

    a {
      text-decoration: none;
      color: ${theme.color.secondary};

      &:hover {
        text-decoration: underline;
      }
    }
  `}
`;

const ActionsWrapper = styled.div`
  ${media.greaterThan('sm')`
    display: none;
`}
`;

export default FootprintFooter;
