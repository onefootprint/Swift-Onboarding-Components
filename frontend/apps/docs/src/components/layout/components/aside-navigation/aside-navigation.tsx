import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles, Typography } from 'ui';

type AsideNavigationProps = {
  section: string;
  items: { title: string; slug: string }[];
};

const AsideNavigation = ({ section, items }: AsideNavigationProps) => {
  const router = useRouter();

  return (
    <Aside>
      <Section>
        <Typography variant="label-4">{section}</Typography>
      </Section>
      <nav>
        {items.map(({ title, slug }) => (
          <Link href={slug} key={slug}>
            <Anchor href={slug} data-selected={router.asPath === slug}>
              {title}
            </Anchor>
          </Link>
        ))}
      </nav>
    </Aside>
  );
};

const Aside = styled.aside`
  ${({ theme }) => css`
    height: 100vh;
    max-height: 100vh;
    padding: ${theme.spacing[7]}px 0;
    position: fixed;
    top: 54px;
    width: 270px;
    background: ${theme.backgroundColor.primary};
  `}
`;

const Section = styled.div`
  ${({ theme }) => css`
    padding-bottom: ${theme.spacing[5]}px;
  `}
`;

const Anchor = styled.a`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    border-radius: ${theme.borderRadius[2]}px;
    display: block;
    padding: ${theme.spacing[3]}px ${theme.spacing[4]}px;
    text-decoration: none;

    &[data-selected='false'] {
      color: ${theme.color.tertiary};

      &:hover {
        background: ${theme.backgroundColor.secondary};
      }
    }

    &[data-selected='true'] {
      color: ${theme.color.primary};
      background: ${theme.backgroundColor.secondary};
    }
  `}
`;

export default AsideNavigation;
