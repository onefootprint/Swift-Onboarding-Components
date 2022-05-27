import { useTranslation } from 'hooks';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled';
import { Container, media, Typography } from 'ui';

type MarkdownLayoutProps = {
  children: React.ReactNode;
  meta: {
    htmlTitleKey: string;
    titleKey: string;
    subtitleKey: string;
  };
};

const MarkdownLayout = ({ children, meta }: MarkdownLayoutProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t(meta.htmlTitleKey)}</title>
      </Head>
      <Container>
        <Inner>
          <Header>
            <Typography
              variant="display-2"
              color="primary"
              sx={{ marginBottom: 5 }}
            >
              {t(meta.titleKey)}
            </Typography>
            <Typography variant="label-2" color="tertiary">
              {t(meta.subtitleKey)}
            </Typography>
          </Header>
          <Article>{children}</Article>
        </Inner>
      </Container>
    </>
  );
};

const Inner = styled.div`
  ${({ theme }) => css`
    padding-bottom: ${theme.spacing[10]}px;

    ${media.greaterThan('lg')`
      padding-bottom: ${theme.spacing[11]}px;
    `}
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]}px;
  `}
`;

const Article = styled.article`
  p:last-child {
    margin-bottom: 0;
  }
`;

export default MarkdownLayout;
