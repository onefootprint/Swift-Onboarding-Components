import { useIntl, useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Container,
  LinkButton,
  media,
  Typography,
} from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import SEO from '../../../../components/seo';
import type { PostDetails } from '../../../../utils/ghost/types';
import Author from '../../components/card/components/author';
import Chip from '../../components/chip';
import HtmlContent from '../../components/html-content';

export type PostProps = {
  post: PostDetails;
};

const PostPage = ({ post }: PostProps) => {
  const { t } = useTranslation('pages.changelog');
  const { formatDateWithLongMonth } = useIntl();
  const formattedDate = formatDateWithLongMonth(new Date(post.published_at));

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
          <ImageContainer>
            <Image
              src={post.feature_image}
              height={900}
              width={900}
              alt={post.feature_image_alt || post.title}
            />
          </ImageContainer>
          <Box
            sx={{
              marginTop: 8,
              marginBottom: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <Typography variant="label-3" color="tertiary">
              {formattedDate}
            </Typography>
            <Typography variant="display-3">{post.title}</Typography>
            <Author
              authorName={post.primary_author.name}
              authorImg={post.primary_author.profile_image}
            />
          </Box>
          {post.html && <HtmlContent html={post.html} />}
        </PostContainer>
      </Container>
    </>
  );
};

const PostContainer = styled.div`
  ${({ theme }) => css`
    max-width: 960px;
    margin: 0 auto ${theme.spacing[12]} auto;
  `}
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

const ImageContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.tertiary};
    background-color: rgba(247, 247, 247, 0.4);
    backdrop-filter: (8px);
    overflow: hidden;
    width: 100%;
    height: 430px;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  `}
`;

export default PostPage;
