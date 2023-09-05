import { useIntl, useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import { Box, Container, LinkButton, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import PostContent from 'src/components/post-content';
import SEO from 'src/components/seo';
import WritingLayout from 'src/components/writing-layout';

import DesktopSharePost from '../../../../components/desktop-share-post';
import PostInfo from '../../../../components/post-info';
import type { PostDetails } from '../../../../utils/ghost/types';

export type PostProps = {
  post: PostDetails;
};

const Post = ({ post }: PostProps) => {
  const { t } = useTranslation('pages.library');
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
        slug={`/library/${post.slug}`}
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
          <WritingLayout>
            <Box sx={{ marginBottom: 8 }}>
              <Link href="/library" passHref legacyBehavior>
                <LinkButton
                  iconPosition="left"
                  iconComponent={IcoChevronLeftBig24}
                  href="/library"
                >
                  {t('go-back')}
                </LinkButton>
              </Link>
            </Box>
            <header>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
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
                  url={`https://www.onefootprint.com/library/${post.slug}`}
                />
              </Box>
              <Typography variant="display-2" as="h1" sx={{ marginY: 9 }}>
                {post.title}
              </Typography>
            </header>
            <PostContent html={post.html} />
          </WritingLayout>
        </Container>
      </article>
    </>
  );
};

export default Post;
