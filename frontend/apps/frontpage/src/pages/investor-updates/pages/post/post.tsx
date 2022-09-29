import { useIntl, useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import Link from 'next/link';
import React from 'react';
import PostContent from 'src/components/post-content';
import SEO from 'src/components/seo';
import styled, { css } from 'styled-components';
import { Box, Container, LinkButton, media, Typography } from 'ui';

import DesktopSharePost from '../../../../components/desktop-share-post';
import PostInfo from '../../../../components/post-info';
import type { PostDetails } from '../../../../utils/ghost/types';
import INVESTOR_UPDATE_HIDE_CREATED_DATE_BEFORE from '../../constants';

export type PostProps = {
  post: PostDetails;
};

const Post = ({ post }: PostProps) => {
  const { t } = useTranslation('pages.investor-updates');
  const { formatDateWithLongMonth } = useIntl();
  const createdDate = new Date(post.created_at);
  const shouldHideDate = createdDate < INVESTOR_UPDATE_HIDE_CREATED_DATE_BEFORE;
  const formattedCreatedDate = shouldHideDate
    ? undefined
    : formatDateWithLongMonth(createdDate);

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
        slug={`/investor-updates/${post.slug}`}
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
              <Link href="/investor-updates" passHref>
                <LinkButton
                  iconPosition="left"
                  iconComponent={IcoChevronLeftBig24}
                  href="/investor-updates"
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
                  createdAt={formattedCreatedDate}
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
                  url={`https://www.onefootprint.com/investor-updates/${post.slug}`}
                />
              </Box>
              <Typography variant="display-2" as="h1" sx={{ marginY: 9 }}>
                {post.title}
                {t('post.update-index', { index: post.meta_description })}
              </Typography>
            </Header>
            <PostContent html={post.html} />
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

export default Post;
