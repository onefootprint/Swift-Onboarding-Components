import { useTranslation } from '@onefootprint/hooks';
import { Button, Container, media, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { getInitialPosts, PostType } from 'src/utils/ghost';
import { Post } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import Card from './components/card/card';
import PostEmpty from './components/card/components/post-empty/post-empty';
import Chip from './components/chip';

export const getStaticProps = async () => {
  const posts = await getInitialPosts(PostType.changelog);
  return { props: { posts } };
};

export type ChangelogProps = {
  posts: Post[];
};

const POSTS_NUMBER = 5;

const Changelog = ({ posts }: ChangelogProps) => {
  const { t } = useTranslation('pages.changelog');
  const [postNumber, setPostNumber] = useState(POSTS_NUMBER);

  const handleLoadMore = async () => {
    setPostNumber(prevPostNumber => prevPostNumber + POSTS_NUMBER);
  };

  return (
    <>
      <SEO title={t('html-title')} slug="/changelog" />
      <Container>
        <HeroContainer>
          <Chip>{t('microtitle')}</Chip>
          <Typography color="primary" variant="display-2" as="h1">
            {t('title')}
          </Typography>
        </HeroContainer>
        {posts.length === 0 ? (
          <PostEmpty />
        ) : (
          <>
            <Timeline>
              {posts.slice(0, postNumber).map((post, index) => (
                <Card
                  key={post.uuid}
                  date={post.created_at}
                  authorName={post.primary_author.name}
                  authorImg={post.primary_author.profile_image}
                  title={post.title}
                  html={post.html}
                  featureImageUrl={post.feature_image}
                  featureImageAlt={post.feature_image_alt || post.title}
                  active={post.featured}
                  last={posts.length === index + 1}
                  slug={post.slug}
                />
              ))}
            </Timeline>
            {posts.length > postNumber && (
              <Actions>
                <Button
                  variant="secondary"
                  size="compact"
                  onClick={() => {
                    handleLoadMore();
                  }}
                >
                  {t('load-more')}
                </Button>
              </Actions>
            )}
          </>
        )}
      </Container>
    </>
  );
};

const HeroContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]};
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[5]};
    margin: auto;
    max-width: 640px;
    padding-top: ${theme.spacing[10]};

    ${media.greaterThan('md')`
      max-width: 830px;
      padding-top: ${theme.spacing[8]};
    `}
  `}
`;

const Timeline = styled.div`
  ${({ theme }) => css`
    margin: ${theme.spacing[10]} auto;
    width: 100%;
  `}
`;

const Actions = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    margin: ${theme.spacing[10]} auto;
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding-top: ${theme.spacing[10]};
  `}
`;

export default Changelog;
