import { useIntl, useTranslation } from '@onefootprint/hooks';
import React from 'react';
import TwitterBreadcrumb from 'src/components/twitter-breadcrumb';
import { getInitialPosts, PostType } from 'src/utils/ghost';
import { Post } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';
import { Container, Divider, media } from 'ui';

import SEO from '../../components/seo';
import SubscribeToNewsletter from '../../components/subscribe-to-newsletter/subscribe-to-newsletter';
import InvestorUpdatePreview from './components/investor-update-preview';
import INVESTOR_UPDATE_HIDE_CREATED_DATE_BEFORE from './constants';

export const getStaticProps = async () => {
  const posts = await getInitialPosts(PostType.investorUpdate);
  return { props: { posts } };
};

export type InvestorUpdatesProps = {
  posts: Post[];
};

const InvestorUpdates = ({ posts }: InvestorUpdatesProps) => {
  const { t } = useTranslation('pages.investor-updates');
  const { formatDateWithLongMonth } = useIntl();
  return (
    <>
      <SEO title={t('html-title')} slug="/investor-updates" />
      <Container>
        <Inner>
          <TwitterBreadcrumb
            title={t('breadcrumb.title')}
            description={t('breadcrumb.description')}
            twitterLabel={t('breadcrumb.twitter')}
          />
          <Posts>
            {posts.map((post, index) => {
              const createdDate = new Date(post.created_at);
              const shouldHideDate =
                createdDate < INVESTOR_UPDATE_HIDE_CREATED_DATE_BEFORE;
              const formattedCreatedDate = shouldHideDate
                ? undefined
                : formatDateWithLongMonth(createdDate);

              return (
                <InvestorUpdatePreview
                  index={posts.length - index}
                  href={`/investor-updates/${post.slug}`}
                  createdAt={formattedCreatedDate}
                  excerpt={post.excerpt}
                  key={post.uuid}
                  title={post.title}
                />
              );
            })}
          </Posts>
          <Divider />
        </Inner>
        <SubscribeToNewsletter />
      </Container>
    </>
  );
};

const Inner = styled.div`
  ${({ theme }) => css`
    margin: -${theme.spacing[7]}px auto ${theme.spacing[7]}px;
    max-width: 960px;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[10]}px;
      margin-top: -${theme.spacing[10]}px;
    `}
  `}
`;

const Posts = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[9]}px;

    > :not(:last-child) {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default InvestorUpdates;
