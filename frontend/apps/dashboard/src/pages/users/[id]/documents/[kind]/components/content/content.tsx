import type { Document } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import DecryptBanner from './components/decrypt-banner';
import Navigation from './components/navigation';
import OCR from './components/ocr';
import Scores from './components/scores';
import SessionSelect from './components/session-select';
import Uploads from './components/uploads';
import useCurrentSession from './hooks/use-current-session';

type ContentProps = {
  documents: Document[];
  meta: {
    notFound: boolean;
    isEncrypted: boolean;
  };
};

const Content = ({ documents, meta }: ContentProps) => {
  const [currentDocument, setCurrentDocument] = useCurrentSession(documents);

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
        <SessionSelect onChange={setCurrentDocument} options={documents} selected={currentDocument} />
      </Box>
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
