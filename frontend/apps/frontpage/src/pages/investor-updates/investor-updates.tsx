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
        <InvestorsContent>
          <TwitterBreadcrumb
            title={t('breadcrumb.title')}
            description={t('breadcrumb.description')}
            twitterLabel={t('breadcrumb.twitter')}
          />
          <Posts>
            {posts.map((post, index) => (
              <InvestorUpdatePreview
                index={posts.length - index}
                href={`/investor-updates/${post.slug}`}
                publishedAt={formatDateWithLongMonth(
                  new Date(post.published_at),
                )}
                excerpt={post.excerpt}
                key={post.uuid}
                title={post.title}
                image={post.feature_image}
              />
            ))}
          </Posts>
          <Divider />
          <SubscribeToNewsletter />
        </InvestorsContent>
      </Container>
    </>
  );
};

const InvestorsContent = styled.div`
  max-width: 960px;
  margin: auto;
`;

const Posts = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-gap: ${theme.spacing[7]};
    margin-bottom: ${theme.spacing[8]};

    ${media.greaterThan('md')`
        grid-gap: 0;
    `}
  `}
`;

export default InvestorUpdates;
