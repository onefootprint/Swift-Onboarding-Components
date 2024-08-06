import { Container, EmptyState } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import SEO from '../../components/seo';

const Page404 = () => {
  const { t } = useTranslation('common', { keyPrefix: '404' });
  return (
    <>
      <SEO title={t('html-title')} />
      <StyledContainer>
        <EmptyState
          title={t('title')}
          description={t('description')}
          renderHeader={() => <Image alt={t('image.alt')} height={212.62} src="/404.png" width={298} priority />}
        />
      </StyledContainer>
    </>
  );
};

const StyledContainer = styled(Container)`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--desktop-header-height) - 16px);
  justify-content: center;
  text-align: center;
  width: 100%;
  padding-top: 0;
`;

export default Page404;
