import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Navigation from './components/navigation';
import OCR from './components/ocr';
import Scores from './components/scores';
import Uploads from './components/uploads';

type ContentProps = {
  doc: Record<string, string>;
};

const Content = ({ doc }: ContentProps) => {
  const { t } = useTranslation('entity-documents');
  // eslint-disable-next-line no-console
  console.log(doc);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <section>
        <Box marginBottom={7}>
          <Navigation />
        </Box>
        <Box marginBottom={7}>
          <Scores document={97} data={95} face={98} />
        </Box>
        <Box marginBottom={7}>
          <Uploads />
        </Box>
        <OCR />
      </section>
    </>
  );
};

export default Content;
