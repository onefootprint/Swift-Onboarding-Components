import { useIntl, useTranslation } from '@onefootprint/hooks';
import { Container, Divider, media } from '@onefootprint/ui';
import React from 'react';
import TwitterBreadcrumb from 'src/components/twitter-breadcrumb';
import SubscribeToNewsletter from 'src/components/writing-layout/components/subscribe-to-newsletter';
import { getInitialPosts, PostType } from 'src/utils/ghost';
import { Post } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
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
                image={post.feature_image}
              />
            );
          })}
        </Posts>
        <Divider />
        <SubscribeToNewsletter />
      </Container>
    </>
  );
};

const Posts = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-gap: ${theme.spacing[8]};
    margin-bottom: ${theme.spacing[8]};

    ${media.greaterThan('md')`
        grid-gap: 0;
    `}
  `}
`;

export default InvestorUpdates;
