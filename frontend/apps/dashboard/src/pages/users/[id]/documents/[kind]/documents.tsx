import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import NotFound from 'src/components/404';

import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import useDocument from './hooks/use-document';

const Documents = () => {
  const { t } = useTranslation('entity-documents');
  const { meta, isPending, errorMessage, data } = useDocument();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      {meta.notFound ? (
        <NotFound />
      ) : (
        <Box aria-busy={isPending}>
          {data && <Content documents={data} meta={meta} />}
          {isPending && <Loading />}
          {errorMessage && <ErrorComponent message={errorMessage} />}
        </Box>
      )}
    </>
  );
};

export default Documents;
