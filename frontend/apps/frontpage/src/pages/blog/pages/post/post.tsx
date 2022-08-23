import { useIntl, useTranslation } from 'hooks';
import { IcoChevronLeftBig24 } from 'icons';
import Link from 'next/link';
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
              <Link href="/blog" passHref>
                <LinkButton
                  iconPosition="left"
                  iconComponent={IcoChevronLeftBig24}
                  href="/blog"
                >
                  {t('go-back')}
                </LinkButton>
              </Link>
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
    color: ${theme.color.secondary};

    img {
      margin-bottom: ${theme.spacing[9]}px;
      max-width: 100%;
      object-fit: cover;
      object-position: left;
    }

    p,
    h2,
    h3 {
      ${media.greaterThan('lg')`
        padding: 0 ${theme.spacing[11]}px;
      `}
    }

    h2,
    h3,
    h4,
    h5,
    h6 {
      color: ${theme.color.primary};

      &:not(:last-child) {
        margin-bottom: ${theme.spacing[6]}px;
      }
    }

    table {
      border-collapse: separate;
      border-radius: ${theme.borderRadius[2]}px;
      border: 1px solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[9]}px;
      table-layout: fixed;
      width: 100%;

      tr:not(:last-child) td {
        border-bottom: 1px solid ${theme.borderColor.tertiary};
      }

      th,
      td {
        padding: ${theme.spacing[5]}px ${theme.spacing[6]}px;
      }

      th {
        ${createFontStyles('caption-1')};
        background: ${theme.backgroundColor.secondary};
        border-bottom: 1px solid ${theme.borderColor.tertiary};
        border-radius: ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0 0;
        color: ${theme.color.primary};
        text-align: left;
        text-transform: uppercase;
      }

      tbody {
        ${createFontStyles('body-3')};
      }
    }

    h2 {
      ${createFontStyles('heading-2')};
    }

    h3 {
      ${createFontStyles('heading-3')};
    }

    p {
      ${createFontStyles('body-1')};

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
