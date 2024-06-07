import { useIntl } from '@onefootprint/hooks';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import { Box, Container, LinkButton, Stack, Text, media } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SEO from '../../../../components/seo';
import type { PostDetails } from '../../../../utils/ghost/types';
import Author from '../../components/card/components/author';
import Chip from '../../components/chip';
import HtmlContent from '../../components/html-content';

export type PostProps = {
  post: PostDetails;
};

const PostPage = ({ post }: PostProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.changelog' });
  const { formatDateWithLongMonth } = useIntl();
  const formattedDate = formatDateWithLongMonth(new Date(post.published_at));

  return (
    <>
      <SEO
        description={post.meta_description}
        image={post.og_image}
        kind="article"
        slug={`/blog/${post.slug}`}
        title={post.title}
      />
      <Container>
        <HeroContainer>
          <Chip>{t('microtitle')}</Chip>
          <Text color="primary" variant="display-2" tag="h1">
            {t('title')}
          </Text>
        </HeroContainer>
        <PostContainer>
          <Link href="/changelog" passHref legacyBehavior>
            <LinkButton iconPosition="left" iconComponent={IcoChevronLeftBig24} href="/changelog">
              {t('go-back')}
            </LinkButton>
          </Link>
          <Box marginBottom={8} />
          <ImageContainer>
            <Image src={post.feature_image} height={900} width={900} alt={post.feature_image_alt || post.title} />
          </ImageContainer>
          <Stack marginTop={8} marginBottom={8} gap={4} direction="column">
            <Text variant="label-3" color="tertiary">
              {formattedDate}
            </Text>
            <Text variant="display-3">{post.title}</Text>
            <Author authorName={post.primary_author.name} authorImg={post.primary_author.profile_image} />
          </Stack>
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
    -webkit-backdrop-filter: (8px);
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
