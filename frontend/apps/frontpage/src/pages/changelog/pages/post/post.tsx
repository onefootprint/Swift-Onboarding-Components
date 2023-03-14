import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import {
  Box,
  Container,
  LinkButton,
  media,
  Typography,
} from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

import SEO from '../../../../components/seo';
import type { PostDetails } from '../../../../utils/ghost/types';
import PostContent from '../../components/card/components/post-content';
import Chip from '../../components/chip';

export type PostProps = {
  post: PostDetails;
};

const PostPage = ({ post }: PostProps) => {
  const { t } = useTranslation('pages.changelog');

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
      <Container>
        <HeroContainer>
          <Chip>{t('microtitle')}</Chip>
          <Typography color="primary" variant="display-2" as="h1">
            {t('title')}
          </Typography>
        </HeroContainer>
        <PostContainer>
          <Link href="/changelog" passHref legacyBehavior>
            <LinkButton
              iconPosition="left"
              iconComponent={IcoChevronLeftBig24}
              href="/changelog"
            >
              {t('go-back')}
            </LinkButton>
          </Link>
          <Box sx={{ marginBottom: 8 }} />
          <PostContent
            date={post.published_at}
            authorName={post.primary_author.name}
            authorImg={post.primary_author.profile_image}
            title={post.title}
            html={post.html}
            featureImageUrl={post.feature_image}
            featureImageAlt={post.feature_image_alt || post.title}
            slug={post.slug}
          />
        </PostContainer>
      </Container>
    </>
  );
};

const PostContainer = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const HeroContainer = styled.div`
  ${({ theme }) => css`
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[5]};
    margin: auto auto ${theme.spacing[8]} auto;
    padding: ${theme.spacing[10]} 0 ${theme.spacing[8]} 0;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    ${media.greaterThan('md')`
      max-width: 960px;
      padding-top: ${theme.spacing[8]};
    `}
  `}
`;

export default PostPage;
