import { useIntl } from '@onefootprint/hooks';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import { Box, Container, LinkButton, Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import PostContent from 'src/components/post-content';
import WritingLayout from 'src/components/writing-layout';

import DesktopSharePost from '../../../../components/desktop-share-post';
import PostInfo from '../../../../components/post-info';
import SEO from '../../../../components/seo';
import type { PostDetails } from '../../../../utils/ghost/types';

export type PostProps = {
  post: PostDetails;
};

const Post = ({ post }: PostProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.investor-updates',
  });
  const { formatDateWithLongMonth } = useIntl();
  const publishedAt = formatDateWithLongMonth(new Date(post.published_at));

  return (
    <>
      <SEO
        description={post.meta_description}
        image={post.og_image}
        kind="article"
        slug={`/investor-updates/${post.slug}`}
        title={post.title}
      />
      <article>
        <Container>
          <WritingLayout>
            <Box marginBottom={8}>
              <Link href="/investor-updates" passHref legacyBehavior>
                <LinkButton iconPosition="left" iconComponent={IcoChevronLeftBig24} href="/investor-updates">
                  {t('go-back')}
                </LinkButton>
              </Link>
            </Box>
            <header>
              <Stack justify="space-between" align="center">
                <PostInfo
                  publishedAt={publishedAt}
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
                  url={`https://www.onefootprint.com/investor-updates/${post.slug}`}
                />
              </Stack>
              <Text variant="display-2" tag="h1" marginBottom={9} marginTop={9}>
                {post.title}
                {t('post.update-index', { index: post.meta_description })}
              </Text>
            </header>
            <PostContent html={post.html} />
          </WritingLayout>
        </Container>
      </article>
    </>
  );
};

export default Post;
