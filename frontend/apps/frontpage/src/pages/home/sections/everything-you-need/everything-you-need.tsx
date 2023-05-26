import { useTranslation } from '@onefootprint/hooks';
import { Container, media } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import Blob from '../../components/blobs';
import DetailsLayout from '../../components/layout/details-layout';
import SquaredFeatureCard from '../../components/squared-feature-card';
import Illustration1 from './components/illustration-1';
import Illustration2 from './components/illustration-2';
import Illustration3 from './components/illustration-3';
import Illustration4 from './components/illustration-4';

const EverythingYouNeed = () => {
  const { t } = useTranslation('pages.home.everything-you-need-section');

  return (
    <Container as="section" id="own-data">
      <Background>
        <DetailsLayout
          title={t('title')}
          subtitle={t('subtitle')}
          type="regular"
        >
          <SquaredFeatureCard
            title={t('features.feature-1.title')}
            body={t('features.feature-1.body')}
            background="pink"
          >
            <Illustration1 />
          </SquaredFeatureCard>
          <SquaredFeatureCard
            title={t('features.feature-2.title')}
            body={t('features.feature-2.body')}
            background="green"
          >
            <Illustration2 />
          </SquaredFeatureCard>
          <SquaredFeatureCard
            title={t('features.feature-3.title')}
            body={t('features.feature-3.body')}
            background="blue"
          >
            <Illustration3 />
          </SquaredFeatureCard>
          <SquaredFeatureCard
            title={t('features.feature-4.title')}
            body={t('features.feature-4.body')}
            background="purple"
          >
            <Illustration4 />
          </SquaredFeatureCard>
        </DetailsLayout>
        <Blob color="#f9f7e0" height={40} width={50} top={10} left={40} />
      </Background>
    </Container>
  );
};

const Background = styled.div`
  background: radial-gradient(
      at 40% 60%,
      #e2edff 30%,
      rgba(246, 209, 193, 0) 50%
    ),
    radial-gradient(at 65% 40%, #f9dff7 12%, rgba(246, 209, 193, 0) 32%);

  ${media.greaterThan('md')`
    background: radial-gradient( at 60% 70%,
      #efe2ff 8%,  rgba(246, 209, 193, 0) 30%),

    radial-gradient(at 30% 50%,
       #e2edff 8%,
        rgba(246, 209, 193, 0) 30%);
  `}
`;

export default EverythingYouNeed;
