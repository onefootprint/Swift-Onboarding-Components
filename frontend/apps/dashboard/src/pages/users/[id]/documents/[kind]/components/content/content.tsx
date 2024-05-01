import type { Document } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React, { useState } from 'react';

import DecryptBanner from './components/decrypt-banner';
import Navigation from './components/navigation';
import OCR from './components/ocr';
import Scores from './components/scores';
import Uploads from './components/uploads';

type ContentProps = {
  documents: Document[];
  meta: {
    notFound: boolean;
    isEncrypted: boolean;
  };
};

const Content = ({ documents, meta }: ContentProps) => {
  const [currentDocument, setCurrentDocument] = useState(() => documents.at(0));
  // eslint-disable-next-line no-console
  console.log('>>> doc', documents);
  // eslint-disable-next-line no-console
  console.log('>>> meta', meta);
  // eslint-disable-next-line no-console
  console.log('currentDocument', currentDocument);
  // eslint-disable-next-line no-console
  console.log('currentDocument', setCurrentDocument);

  return currentDocument ? (
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
        <Scores
          document={currentDocument.documentScore}
          ocr={currentDocument.ocrConfidenceScore}
          selfie={currentDocument.selfieScore}
        />
      </Box>
      <Box marginBottom={7}>
        <Uploads />
      </Box>
      <OCR />
    </section>
  ) : null;
};

export default Content;
