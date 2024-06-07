import { useIntl } from '@onefootprint/hooks';
import { Container, Divider, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TwitterBreadcrumb from 'src/components/twitter-breadcrumb';
import SubscribeToNewsletter from 'src/components/writing-layout/components/subscribe-to-newsletter';
import { PostType, getInitialPosts } from 'src/utils/ghost';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import type { Post } from '../../utils/ghost/types';
import PostPreview from './components/post-preview';

export const getStaticProps = async () => {
  const posts = await getInitialPosts(PostType.blog);
  return { props: { posts } };
};

export type BlogProps = {
  posts: Post[];
};

const Blog = ({ posts }: BlogProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.blog' });
  const { formatDateWithLongMonth } = useIntl();
  const [featuredPost, ...allPosts] = posts;

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/blog" />
      <Container>
        <BlogGrid>
          <TwitterBreadcrumb
            title={t('breadcrumb.title')}
            description={t('breadcrumb.description')}
            twitterLabel={t('breadcrumb.twitter')}
          />
          <FeaturedPost>
            <PostPreview
              href={`/blog/${featuredPost.slug}`}
              authors={featuredPost.authors.map(author => ({
                id: author.id,
                avatarImgUrl: author.profile_image,
                name: author.name,
              }))}
              primaryTag={featuredPost.primary_tag.name}
              featureImageUrl={featuredPost.feature_image}
              featureImageAlt={featuredPost.feature_image_alt || featuredPost.title}
              publishedAt={formatDateWithLongMonth(new Date(featuredPost.published_at))}
              excerpt={featuredPost.excerpt}
              key={featuredPost.uuid}
              title={featuredPost.title}
              type="featured"
            />
          </FeaturedPost>
          <Posts>
            {allPosts.map(post => (
              <PostPreview
                href={`/blog/${post.slug}`}
                authors={post.authors.map(author => ({
                  id: author.id,
                  avatarImgUrl: author.profile_image,
                  name: author.name,
                }))}
                primaryTag={post.primary_tag?.name}
                featureImageUrl={post.feature_image}
                featureImageAlt={post.feature_image_alt || post.title}
                publishedAt={formatDateWithLongMonth(new Date(post.published_at))}
                excerpt={post.excerpt}
                key={post.uuid}
                title={post.title}
                type="regular"
              />
            ))}
          </Posts>
          <StyledDivider />
        </BlogGrid>
        <SubscribeToNewsletter />
      </Container>
    </>
  );
};

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[10]};
  `}
`;

const BlogGrid = styled.div`
  margin: auto;
  max-width: 960px;
`;

const FeaturedPost = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]};
  `}
`;

const Posts = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[7]};

    ${media.greaterThan('md')`
      grid-template-columns: repeat(2, 1fr);
    `}
  `}
`;

export default Blog;
