import { useIntl, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Container, Divider, media } from '@onefootprint/ui';
import React from 'react';
import TwitterBreadcrumb from 'src/components/twitter-breadcrumb';
import WritingLayout from 'src/components/writing-layout';
import { getInitialPosts, PostType } from 'src/utils/ghost';
import type { Post } from 'src/utils/ghost/types';

import SEO from '../../components/seo';
import LibraryPostPreview from './components/library-post-preview';

export const getStaticProps = async () => {
  const posts = await getInitialPosts(PostType.library);
  return { props: { posts } };
};

export type InvestorUpdatesProps = {
  posts: Post[];
};

const Library = ({ posts }: InvestorUpdatesProps) => {
  const { t } = useTranslation('pages.library');
  const { formatDateWithLongMonth } = useIntl();
  return (
    <>
      <SEO title={t('html-title')} slug="/library" />
      <Container>
        <WritingLayout>
          <TwitterBreadcrumb
            title={t('breadcrumb.title')}
            description={t('breadcrumb.description')}
            twitterLabel={t('breadcrumb.twitter')}
          />
          <Posts>
            {posts.map(post => (
              <LibraryPostPreview
                href={`/library/${post.slug}`}
                author={{
                  avatarImgUrl: post.primary_author.profile_image,
                  name: post.primary_author.name,
                }}
                featureImageUrl={post.feature_image}
                featureImageAlt={post.feature_image_alt || post.title}
                publishedAt={formatDateWithLongMonth(
                  new Date(post.published_at),
                )}
                excerpt={post.excerpt}
                key={post.uuid}
                title={post.title}
              />
            ))}
          </Posts>
          <StyledDivider />
        </WritingLayout>
      </Container>
    </>
  );
};

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[9]};
  `}
`;

const Posts = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      grid-template-columns: repeat(2, 1fr);
    `}
  `}
`;

export default Library;
