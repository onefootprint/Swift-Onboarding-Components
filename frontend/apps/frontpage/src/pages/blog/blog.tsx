import { useIntl, useTranslation } from 'hooks';
import { IcoArrowRightSmall24 } from 'icons';
import React from 'react';
import { getInitialPosts } from 'src/utils/ghost';
import styled, { css } from 'styled-components';
import { Container, LinkButton, media, Typography } from 'ui';

import SEO from '../../components/seo';
import PostPreview from './components/post-preview';
import type { Post } from './types';

export const getStaticProps = async () => {
  const posts = await getInitialPosts();
  return { props: { posts } };
};

export type BlogProps = {
  posts: Post[];
};

const Blog = ({ posts }: BlogProps) => {
  const { t } = useTranslation('pages.blog');
  const { formatDateWithLongMonth } = useIntl();
  const [featuredPost, ...allPosts] = posts;

  return (
    <>
      <SEO title={t('html-title')} slug="/blog" />
      <Container>
        <Inner>
          <BreadcrumbContainer>
            <Breadcrumb>
              <BreadcrumbTitleContainer>
                <Typography color="primary" variant="label-2" as="span">
                  {t('breadcrumb.title')}
                </Typography>
                <Typography color="primary" variant="label-2" as="span">
                  {t('breadcrumb.description')}
                </Typography>
              </BreadcrumbTitleContainer>
              <LinkButton
                href="https://twitter.com/footprint_hq"
                iconComponent={IcoArrowRightSmall24}
                target="_blank"
              >
                {t('breadcrumb.twitter')}
              </LinkButton>
            </Breadcrumb>
          </BreadcrumbContainer>
          <FeaturedPost>
            <PostPreview
              href={`/blog/${featuredPost.slug}`}
              author={{
                avatarImgUrl: featuredPost.primary_author.profile_image,
                name: featuredPost.primary_author.name,
              }}
              primaryTag={featuredPost.primary_tag.name}
              featureImageUrl={featuredPost.feature_image}
              featureImageAlt={
                featuredPost.feature_image_alt || featuredPost.title
              }
              createdAt={formatDateWithLongMonth(
                new Date(featuredPost.created_at),
              )}
              excerpt={featuredPost.excerpt}
              key={featuredPost.uuid}
              title={featuredPost.title}
            />
          </FeaturedPost>
          <Posts>
            {allPosts.map(post => (
              <PostPreview
                href={`/blog/${post.slug}`}
                author={{
                  avatarImgUrl: post.primary_author.profile_image,
                  name: post.primary_author.name,
                }}
                primaryTag={post.primary_tag.name}
                featureImageUrl={post.feature_image}
                featureImageAlt={post.feature_image_alt || post.title}
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

const Breadcrumb = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius[2]}px;
    display: flex;
    justify-content: space-between;
    margin: 0 -${theme.spacing[5]}px 0;
    padding: ${theme.spacing[4]}px ${theme.spacing[7]}px;

    ${media.greaterThan('lg')`
      margin: initial;
    `}
  `}
`;

const BreadcrumbTitleContainer = styled.div`
  span:last-child {
    display: none;
  }

  ${media.greaterThan('lg')`
    span:last-child {
      display: inline;
    }
  `}
`;

const BreadcrumbContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]}px;
  `}
`;

const FeaturedPost = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]}px;
  `}
`;

const Posts = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[7]}px;

    ${media.greaterThan('md')`
      grid-template-columns: repeat(2, 1fr);
    `}
  `}
`;

export default Blog;
