import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import DecryptBanner from './components/decrypt-banner';
import Navigation from './components/navigation';
import OCR from './components/ocr';
import Scores from './components/scores';
import Uploads from './components/uploads';

type ContentProps = {
  doc: Record<DataIdentifier, VaultValue>;
  meta: {
    notFound: boolean;
    isEncrypted: boolean;
  };
};

const Content = ({ doc, meta }: ContentProps) => {
  // eslint-disable-next-line no-console
  console.log('>>> doc', doc);
  // eslint-disable-next-line no-console
  console.log('>>> meta', meta);

  return (
    <section>
      <Box marginBottom={7}>
        <Navigation />
      </Box>
      {meta.isEncrypted && (
        <Box marginBottom={7}>
          <DecryptBanner />
        </Box>
      )}
      <Box marginBottom={7}>
        <Scores document={97} data={95} face={98} />
      </Box>
      <Box marginBottom={7}>
        <Uploads />
      </Box>
      <OCR />
    </section>
  );
};

export default Content;
