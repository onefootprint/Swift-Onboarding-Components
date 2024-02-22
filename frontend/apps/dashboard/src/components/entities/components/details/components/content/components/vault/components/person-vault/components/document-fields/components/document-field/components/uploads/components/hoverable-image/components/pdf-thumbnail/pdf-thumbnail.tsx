import { Box } from '@onefootprint/ui';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

type PdfThumbnailProps = {
  src: string;
};

const Document = dynamic(() => import('react-pdf').then(res => res.Document), {
  ssr: false,
});

const Page = dynamic(() => import('react-pdf').then(res => res.Page), {
  ssr: false,
});

const PdfThumbnail = ({ src }: PdfThumbnailProps) => {
  const [currPageNumber, setCurrPageNumber] = useState<number>(1);

  const loadWebWorkerForPdf = async () => {
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url,
    ).toString();
  };

  useEffect(() => {
    loadWebWorkerForPdf();
  }, []);

  const onDocumentLoadSuccess = () => {
    setCurrPageNumber(1);
  };

  return (
    <Container>
      <Document file={src} onLoadSuccess={onDocumentLoadSuccess}>
        <Page
          renderTextLayer={false}
          renderAnnotationLayer={false}
          pageNumber={currPageNumber}
          height={200}
        />
      </Document>
    </Container>
  );
};

const Container = styled(Box)`
  ${({ theme }) => css`
    width: 160px;
    height: 200px;
    overflow: hidden;
    position: relative;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default PdfThumbnail;
