import { useIntl, useTranslation } from 'hooks';
import IcoArrowRightSmall24 from 'icons/ico/ico-arrow-right-small-24';
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
  const [latestPost] = posts;

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
          <PostPreview
            href={`/blog/${latestPost.slug}`}
            author={{
              avatarImgUrl: latestPost.primary_author.profile_image,
              name: latestPost.primary_author.name,
            }}
            primaryTag={latestPost.primary_tag.name}
            featureImageUrl={latestPost.feature_image}
            featureImageAlt={latestPost.feature_image_alt || latestPost.title}
            createdAt={formatDateWithLongMonth(new Date(latestPost.created_at))}
            excerpt={latestPost.excerpt}
            key={latestPost.uuid}
            title={latestPost.title}
          />
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

// const GridList = styled.div`
//   ${({ theme }) => css`
//     display: grid;
//     gap: ${theme.spacing[7]}px;
//     grid-template-rows: 512px;

//     ${media.greaterThan('md')`
//       grid-template-columns: repeat(2, 1fr);
//     `}
//   `}
// `;

export default Blog;
