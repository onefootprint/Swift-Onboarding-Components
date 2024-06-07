import { Button, Container, Divider, Stack, Text, media } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PostType, getInitialPosts } from 'src/utils/ghost';
import type { PostDetails } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import Card from './components/card';
import PostEmpty from './components/card/components/post-empty';
import Chip from './components/chip';

export const getStaticProps = async () => {
  const posts = await getInitialPosts(PostType.changelog);
  return { props: { posts } };
};

export type ChangelogProps = {
  posts: PostDetails[];
};

const POSTS_NUMBER = 5;

const Changelog = ({ posts }: ChangelogProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.changelog' });
  const [postNumber, setPostNumber] = useState(POSTS_NUMBER);

  const loadMorePosts = () => {
    setPostNumber(prevPostNumber => prevPostNumber + POSTS_NUMBER);
  };

  const RECAP_TAG = 'recap';

  const regularPosts = posts.map(post => (!post.tags.some(tag => tag.slug === RECAP_TAG) ? post : null));

  const truncatedRegularPosts = regularPosts.slice(0, postNumber);

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/changelog" />
      <Container>
        <HeroContainer>
          <Chip>{t('microtitle')}</Chip>
          <Text color="primary" variant="display-2" tag="h1">
            {t('title')}
          </Text>
        </HeroContainer>
        {posts.length === 0 ? (
          <PostEmpty />
        ) : (
          <>
            <Timeline direction="column">
              {truncatedRegularPosts.map(
                (post, index) =>
                  post && <Card post={post} hideLine={truncatedRegularPosts.length !== index + 1} key={post.uuid} />,
              )}
            </Timeline>
            <Divider variant="secondary" />
            <Stack justifyContent="center" padding={9}>
              {postNumber < posts.length && (
                <Button variant="secondary" onClick={loadMorePosts}>
                  {t('load-more')}
                </Button>
              )}
            </Stack>
          </>
        )}
      </Container>
    </>
  );
};

const HeroContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]} 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[5]};
    margin: auto;
    max-width: 640px;

    ${media.greaterThan('md')`
      max-width: 830px;
      padding-top: ${theme.spacing[8]};
    `}
  `}
`;

const Timeline = styled(Stack)`
  ${({ theme }) => css`
    margin: ${theme.spacing[10]} auto;
    width: 100%;
  `}
`;

export default Changelog;
