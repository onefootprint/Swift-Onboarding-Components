import { IcoArrowRightSmall24 } from '@onefootprint/icons';
import {
  Button,
  Container,
  createFontStyles,
  media,
  Typography,
} from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getInitialPosts, PostType } from 'src/utils/ghost';
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
const BLUR_COLORS = [
  'rgba(171, 255, 163, .15)',
  'rgba(255, 127, 127, 0.15)',
  'rgba(85, 139, 255, 0.15)',
  'rgba(255, 255, 127, 0.15)',
  'rgba(255, 127, 255, 0.15)',
];

const Changelog = ({ posts }: ChangelogProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.changelog' });
  const [postNumber, setPostNumber] = useState(POSTS_NUMBER);
  const handleLoadMore = async () => {
    setPostNumber(prevPostNumber => prevPostNumber + POSTS_NUMBER);
  };

  const RECAP_TAG = 'recap';
  const recapPosts = posts.map(post =>
    post.tags.some(tag => tag.slug === RECAP_TAG) ? post : null,
  );
  const regularPosts = posts.map(post =>
    !post.tags.some(tag => tag.slug === RECAP_TAG) ? post : null,
  );

  const truncatedRegularPosts = regularPosts.slice(0, postNumber);

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
              {truncatedRegularPosts.map(
                (post, index) =>
                  post && (
                    <Card
                      post={post}
                      blurColor={BLUR_COLORS[index % BLUR_COLORS.length]}
                      showLine={posts.length !== index + 1}
                      key={post.uuid}
                    />
                  ),
              )}
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
      <Recaps>
        <Typography color="primary" variant="display-3" as="h1">
          {t('recaps-title')}
        </Typography>
        <Links>
          {recapPosts.map(
            post =>
              post && (
                <RecapCard key={post.uuid} href={`/changelog/${post.slug}`}>
                  {new Date(post.published_at).toLocaleString('default', {
                    month: 'long',
                  })}
                  <IcoArrowRightSmall24 />
                </RecapCard>
              ),
          )}
        </Links>
      </Recaps>
    </>
  );
};

const Recaps = styled.div`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[10]};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[8]};
    width: 100%;

    a {
      text-decoration: none;
    }
  `}
`;

const RecapCard = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('heading-2')}
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[4]} ${theme.spacing[6]};
    display: flex;
    align-items: center;
    width: fit-content;
    justify-content: center;
    gap: ${theme.spacing[2]};
    color: ${theme.color.primary};
    transition: all 0.2s ease-in-out;

    @media (hover: hover) {
      &:hover {
        border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
        box-shadow: ${theme.elevation[1]};
      }
    }
  `}
`;

const Links = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[4]};
  `}
`;

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
