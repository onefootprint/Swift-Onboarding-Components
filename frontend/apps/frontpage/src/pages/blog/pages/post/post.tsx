import { useIntl } from '@onefootprint/hooks';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import { Container, LinkButton, media, Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PostContent from 'src/components/post-content';
import WritingLayout from 'src/components/writing-layout';
import styled, { css } from 'styled-components';

import DesktopSharePost from '../../../../components/desktop-share-post';
import PostInfo from '../../../../components/post-info';
import SEO from '../../../../components/seo';
import type { PostDetails } from '../../../../utils/ghost/types';

export type PostProps = {
  post: PostDetails;
};

const Post = ({ post }: PostProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.blog' });
  const { formatDateWithLongMonth } = useIntl();

  return (
    <>
      <SEO
        title={post.title}
        description={post.meta_description}
        image={post.og_image}
        kind="article"
        slug={`/blog/${post.slug}`}
      />
      <article>
        <Container>
          <WritingLayout>
            <BackButtonLink href="/blog" passHref>
              <LinkButton
                iconPosition="left"
                iconComponent={IcoChevronLeftBig24}
                href="/blog"
              >
                {t('go-back')}
              </LinkButton>
            </BackButtonLink>
            <header>
              <Stack justify="space-between" align="center">
                <PostInfo
                  publishedAt={formatDateWithLongMonth(
                    new Date(post.published_at),
                  )}
                  authors={post.authors.map(author => ({
                    id: author.id,
                    profileImage: author.profile_image,
                    name: author.name,
                  }))}
                  readingTime={post.reading_time}
                  tag={{
                    name: post.primary_tag.name,
                  }}
                />
                <DesktopSharePost
                  title={post.og_title}
                  url={`https://www.onefootprint.com/blog/${post.slug}`}
                />
              </Stack>
              <Text variant="display-2" tag="h1" marginTop={9} marginBottom={9}>
                {post.title}
              </Text>
            </header>
            <PostContent html={post.html} />
          </WritingLayout>
        </Container>
      </article>
    </>
  );
};

const BackButtonLink = styled(Link)`
  ${({ theme }) => css`
    display: flex;
    text-decoration: none;
    margin-bottom: ${theme.spacing[6]};

    ${media.greaterThan('sm')`
      margin-bottom: ${theme.spacing[8]};
    `}
  `}
`;

export default Post;
