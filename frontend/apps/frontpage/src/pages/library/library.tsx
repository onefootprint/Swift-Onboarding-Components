import { useIntl, useTranslation } from 'hooks';
import React from 'react';
import TwitterBreadcrumb from 'src/components/twitter-breadcrumb';
import { getInitialPosts, PostType } from 'src/utils/ghost';
import { Post } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';
import { Container, Divider, media } from 'ui';

import SEO from '../../components/seo';
import SubscribeToNewsletter from '../../components/subscribe-to-newsletter';
import LibraryPostPreview from './components/library-post-preview';

export const getStaticProps = async () => {
  const posts = await getInitialPosts(PostType.library);
  return { props: { posts } };
};

export type InvestorUpdatesProps = {
  posts: Post[];
};

const Library = ({ posts }: InvestorUpdatesProps) => {
  const { t } = useTranslation('pages.library');
  const { formatDateWithLongMonth } = useIntl();
  return (
    <>
      <SEO title={t('html-title')} slug="/library" />
      <Container>
        <Inner>
          <TwitterBreadcrumb
            title={t('breadcrumb.title')}
            description={t('breadcrumb.description')}
            twitterLabel={t('breadcrumb.twitter')}
          />
          <Posts>
            {posts.map(post => (
              <LibraryPostPreview
                href={`/library/${post.slug}`}
                author={{
                  avatarImgUrl: post.primary_author.profile_image,
                  name: post.primary_author.name,
                }}
                featureImageUrl={post.feature_image}
                featureImageAlt={post.feature_image_alt || post.title}
                createdAt={formatDateWithLongMonth(new Date(post.created_at))}
                excerpt={post.excerpt}
                key={post.uuid}
                title={post.title}
              />
            ))}
          </Posts>
          <Divider />
        </Inner>
        <SubscribeToNewsletter />
      </Container>
    </>
  );
};

const Posts = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[7]}px;

    ${media.greaterThan('md')`
      grid-template-columns: repeat(2, 1fr);
    `}
  `}
`;

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

export default Library;
