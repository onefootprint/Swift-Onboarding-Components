import { Container, EmptyState } from '@onefootprint/ui';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type ErrorProps = {
  resetErrorBoundary: () => void;
};

const ErrorComponent = ({ resetErrorBoundary }: ErrorProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'error' });

  return (
    <>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <ErrorContainer>
        <Container>
          <EmptyState
            title={t('title')}
            description={t('description')}
            cta={{
              label: t('cta'),
              onClick: resetErrorBoundary,
            }}
            renderHeader={() => <Image alt={t('image.alt')} height={212.62} src="/404.svg" width={298} priority />}
          />
        </Container>
      </ErrorContainer>
    </>
  );
};

const ErrorContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export default ErrorComponent;
