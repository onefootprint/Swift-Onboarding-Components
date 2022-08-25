import { useIntl, useTranslation } from 'hooks';
import React from 'react';
import TwitterBreadcrumb from 'src/components/twitter-breadcrumb';
import { getInitialPosts, PostType } from 'src/utils/ghost';
import { Post } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';
import { Container, media } from 'ui';

import SEO from '../../components/seo';
import InvestorUpdatePreview from './components/investor-update-preview';

export const getStaticProps = async () => {
  const posts = await getInitialPosts(PostType.investorUpdate);
  return { props: { posts } };
};

export type InvestorUpdatesProps = {
  posts: Post[];
};

const InvestorUpdates = ({ posts }: InvestorUpdatesProps) => {
  const { t } = useTranslation('pages.investor-updates');
  const { formatDateWithLongMonth } = useIntl();
  return (
    <>
      <SEO title={t('html-title')} slug="/investor-updates" />
      <Container>
        <Inner>
          <TwitterBreadcrumb
            title={t('breadcrumb.title')}
            description={t('breadcrumb.description')}
            twitterLabel={t('breadcrumb.twitter')}
          />
          <Posts>
            {posts.map((post, index) => (
              <InvestorUpdatePreview
                index={posts.length - index}
                href={`/investor-updates/${post.slug}`}
                createdAt={formatDateWithLongMonth(new Date(post.created_at))}
                excerpt={post.excerpt}
                key={post.uuid}
                title={post.title}
              />
            ))}
          </Posts>
        </Inner>
      </Container>
    </>
  );
};

const Inner = styled.div`
  ${({ theme }) => css`
    margin: -${theme.spacing[7]}px auto ${theme.spacing[7]}px;
    max-width: 960px;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[10]}px;
      margin-top: -${theme.spacing[10]}px;
    `}
  `}
`;

const Posts = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[7]}px;
  `}
`;

export default InvestorUpdates;
