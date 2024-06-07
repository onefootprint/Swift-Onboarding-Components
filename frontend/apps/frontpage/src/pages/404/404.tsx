import { EmptyState, Stack } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';

const Page404 = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.404' });
  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/404" />
      <Container width="100%" justifyContent="center" alignItems="center">
        <EmptyState
          title={t('title')}
          description={t('description')}
          renderHeader={() => <Image alt={t('image.alt')} height={212} src="/404.png" width={298} priority />}
        />
      </Container>
    </>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    height: calc(100vh - ${theme.spacing[15]});
    margin-top: -54px;
  `}
`;

export default Page404;
