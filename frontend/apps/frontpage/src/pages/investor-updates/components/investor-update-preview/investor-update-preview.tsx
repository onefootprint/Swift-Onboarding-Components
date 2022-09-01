import { useTranslation } from 'hooks';
import { IcoArrowRightSmall16 } from 'icons';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { LinkButton, media, Typography } from 'ui';

type InvestorUpdatePreviewProps = {
  index: number;
  excerpt: string;
  href: string;
  title: string;
  createdAt?: string;
};

const InvestorUpdatePreview = ({
  index,
  createdAt,
  excerpt,
  href,
  title,
}: InvestorUpdatePreviewProps) => {
  const { t } = useTranslation('pages.investor-updates');

  return (
    <Article>
      <Header>
        <Typography variant="label-2" sx={{ marginBottom: 6 }}>
          {t('header-title-prefix', { index })}
        </Typography>
        {!!createdAt && (
          <Typography variant="body-2" color="tertiary">
            {createdAt}
          </Typography>
        )}
      </Header>
      <Content>
        <Link href={href}>
          <a href={href}>
            <Typography variant="heading-1" sx={{ marginBottom: 8 }}>
              {title}
            </Typography>
          </a>
        </Link>
        <Typography variant="body-2">{excerpt}</Typography>
        <LinkButton
          sx={{ marginTop: 7, cursor: 'pointer' }}
          iconComponent={IcoArrowRightSmall16}
          iconPosition="right"
          href={href}
        >
          {t('read-more')}
        </LinkButton>
      </Content>
    </Article>
  );
};

const Article = styled.article`
  display: block;

  ${media.greaterThan('md')`
    display: flex;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-bottom: ${theme.spacing[9]}px;

    a {
      text-decoration: none;
    }
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    --header-width: 240px;
    width: var(--header-width);
    min-width: var(--header-width);
    display: flex;
    flex-direction: column;
    margin-right: ${theme.spacing[7]}px;
  `}
`;

export default InvestorUpdatePreview;
