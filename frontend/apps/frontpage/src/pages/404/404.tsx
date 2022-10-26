import { useTranslation } from '@onefootprint/hooks';
import { Container, EmptyState } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const Page404 = () => {
  const { t } = useTranslation('pages.404');
  return (
    <Container>
      <Inner>
        <EmptyState
          title={t('title')}
          description={t('description')}
          renderHeader={() => (
            <Image
              alt={t('image.alt')}
              height={212.62}
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
