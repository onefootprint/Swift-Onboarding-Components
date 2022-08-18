import { useTranslation } from 'hooks';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { Container, Typography } from 'ui';

import SEO from '../../components/seo';

const Page404 = () => {
  const { t } = useTranslation('pages.404');
  return (
    <>
      <SEO title={t('title')} slug="/" />
      <Container>
        <Inner>
          <Image
            alt={t('image.alt')}
            height={212.62}
            layout="fixed"
            src="/404.png"
            width={298}
          />
          <Typography
            variant="heading-3"
            as="h2"
            sx={{ marginTop: 9, marginBottom: 3 }}
          >
            {t('title')}
          </Typography>
          <Typography color="secondary" variant="body-1" as="h3">
            {t('description')}
          </Typography>
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
