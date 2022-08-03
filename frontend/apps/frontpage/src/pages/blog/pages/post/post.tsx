import { useIntl, useTranslation } from 'hooks';
import IcoChevronLeftBig24 from 'icons/ico/ico-chevron-left-big-24';
import React from 'react';
import SEO from 'src/components/seo';
import styled, { css } from 'styled-components';
import {
  Box,
  Container,
  createFontStyles,
  LinkButton,
  media,
  Typography,
} from 'ui';

import type { PostDetails } from '../../types';
import DesktopSharePost from './components/desktop-share-post';
import PostInfo from './components/post-info';

export type PostProps = {
  post: PostDetails;
};

const Post = ({ post }: PostProps) => {
  const { t } = useTranslation('pages.blog');
  const { formatDateWithLongMonth } = useIntl();

  return (
    <>
      <SEO
        description={post.meta_description}
        image={post.og_image}
        kind="article"
        og={{
          description: post.og_description,
          image: post.og_image,
          title: post.og_title,
          author: post.primary_author.name,
        }}
        slug={`/blog/${post.slug}`}
        title={post.title}
        twitter={{
          description: post.twitter_description,
          image: post.twitter_image,
          title: post.twitter_title,
          extraData: [
            { label: 'Written by', data: post.primary_author.name },
            { label: 'Reading time', data: `${post.reading_time} minutes` },
          ],
        }}
      />
      <article>
        <Container>
          <Inner>
            <Box sx={{ marginBottom: 8 }}>
              <LinkButton
                iconPosition="left"
                iconComponent={IcoChevronLeftBig24}
                href="/blog"
              >
                {t('go-back')}
              </LinkButton>
            </Box>
            <Header>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <PostInfo
                  createdAt={formatDateWithLongMonth(new Date(post.created_at))}
                  author={{
                    name: post.primary_author.name,
                    profileImage: post.primary_author.profile_image,
                  }}
                  readingTime={post.reading_time}
                  tag={{
                    name: post.primary_tag.name,
                  }}
                />
                <DesktopSharePost
                  title={post.og_title}
                  url={`https://www.onefootprint.com/blog/${post.slug}`}
                />
              </Box>
              <Typography variant="display-2" as="h1" sx={{ marginY: 9 }}>
                {post.title}
              </Typography>
            </Header>
            <Content dangerouslySetInnerHTML={{ __html: post.html }} />
          </Inner>
        </Container>
      </article>
    </>
  );
};

const Inner = styled.div`
  ${({ theme }) => css`
    margin: -${theme.spacing[3]}px auto ${theme.spacing[10]}px;
    max-width: 960px;

    ${media.greaterThan('lg')`
      margin-top: -${theme.spacing[10]}px;
    `}
  `}
`;

const Header = styled.header``;

const Content = styled.div`
  ${({ theme }) => css`
    img {
      margin-bottom: ${theme.spacing[9]}px;
      object-fit: cover;
      max-width: 100%;
    }

    p {
      ${createFontStyles('body-1')};
      color: ${theme.color.secondary};

      ${media.greaterThan('lg')`
        padding: 0 ${theme.spacing[11]}px;
      `}

      &:not(:last-child) {
        margin-bottom: ${theme.spacing[9]}px;
      }
    }

    a {
      color: ${theme.color.accent};
    }
  `}
`;

export default Post;
