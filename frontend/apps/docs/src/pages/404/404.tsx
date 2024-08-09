import { Container, EmptyState } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import router from 'next/router';
import { API_REFERENCE_PATH } from 'src/config/constants';
import SEO from '../../components/seo';

const Page404 = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.404' });
  const isApiReference = router.asPath.startsWith(API_REFERENCE_PATH);
  const redirectUrl = isApiReference ? `${API_REFERENCE_PATH}` : '/';
  console.log('redirectUrl', redirectUrl);
  return (
    <>
      <SEO title={t('title')} />
      <Container>
        <Inner>
          <EmptyState
            title={t('title')}
            description={t('description')}
            renderHeader={() => <Image alt={t('image.alt')} src="/404.png" height={212} width={298} priority />}
            cta={{ label: t('cta.label'), onClick: () => router.push(redirectUrl) }}
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
