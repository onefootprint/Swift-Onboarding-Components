import { Container, EmptyState } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import SEO from '../../components/seo';

const Page404 = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.404' });
  return (
    <>
      <SEO title={t('title')} slug="/" />
      <Container>
        <Inner>
          <EmptyState
            title={t('title')}
            description={t('description')}
            renderHeader={() => <Image alt={t('image.alt')} src="/404.png" height={212} width={298} priority />}
          />
        </Inner>
      </Container>
    </>
  );
};

const Inner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export default Page404;
