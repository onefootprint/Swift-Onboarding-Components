import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Container, media, Typography } from '@onefootprint/ui';
import React from 'react';

import SEO from '../seo';

type MarkdownLayoutProps = {
  children: React.ReactNode;
  meta: {
    slug: string;
    htmlTitleKey: string;
    titleKey: string;
    subtitleKey: string;
  };
};

const MarkdownLayout = ({ children, meta }: MarkdownLayoutProps) => {
  const { t } = useTranslation();
  return (
    <>
      <SEO title={t(meta.htmlTitleKey)} slug={meta.slug} />
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
          </Header>
          <Article>{children}</Article>
        </Inner>
      </Container>
    </>
  );
};

const Inner = styled.div`
  ${({ theme }) => css`
    padding-bottom: ${theme.spacing[10]};

    ${media.greaterThan('lg')`
      padding-bottom: ${theme.spacing[14]};
    `}
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]};
  `}
`;

const Article = styled.article`
  p:last-child {
    margin-bottom: 0;
  }

  li p {
    margin-bottom: 0;
  }
`;

export default MarkdownLayout;
