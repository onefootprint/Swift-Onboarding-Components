import { useIntl } from '@onefootprint/hooks';
import { Container, Divider, Grid, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import TwitterBreadcrumb from 'src/components/twitter-breadcrumb';
import SubscribeToNewsletter from 'src/components/writing-layout/components/subscribe-to-newsletter';
import { PostType, getInitialPosts } from 'src/utils/ghost';
import type { Post } from 'src/utils/ghost/types';
import styled from 'styled-components';

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
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.investor-updates',
  });
  const { formatDateWithLongMonth } = useIntl();

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/investor-updates" />
      <Container>
        <InvestorsContent>
          <TwitterBreadcrumb
            title={t('breadcrumb.title')}
            description={t('breadcrumb.description')}
            twitterLabel={t('breadcrumb.twitter')}
          />
          <Posts gap={7} marginBottom={8}>
            {posts.map((post, index) => (
              <InvestorUpdatePreview
                index={posts.length - index}
                href={`/investor-updates/${post.slug}`}
                publishedAt={formatDateWithLongMonth(new Date(post.published_at))}
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

const Posts = styled(Grid.Container)`
  ${media.greaterThan('md')`
        grid-gap: 0;
    `}
`;

export default InvestorUpdates;
