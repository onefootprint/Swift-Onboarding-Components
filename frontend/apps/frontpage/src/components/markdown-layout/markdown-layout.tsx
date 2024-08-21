import { Container, Text, media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

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
  const { t } = useTranslation('common');
  return (
    <>
      <SEO title={t(meta.htmlTitleKey as ParseKeys<'common'>)} slug={meta.slug} />
      <Container>
        <Inner>
          <Header>
            <Text variant="display-2" color="primary" marginBottom={5}>
              {t(meta.titleKey as ParseKeys<'common'>)}
            </Text>
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
