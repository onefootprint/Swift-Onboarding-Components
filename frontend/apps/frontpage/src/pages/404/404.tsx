import { useTranslation } from 'hooks';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { Container, EmptyState } from 'ui';

const Page404 = () => {
  const { t } = useTranslation('pages.404');
  return (
    <Container>
      <Inner>
        <EmptyState
          title={t('title')}
          description={t('description')}
          renderImage={() => (
            <Image
              alt={t('image.alt')}
              height={212.62}
              layout="fixed"
              src="/404.png"
              width={298}
              priority
            />
          )}
        />
      </Inner>
    </Container>
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
