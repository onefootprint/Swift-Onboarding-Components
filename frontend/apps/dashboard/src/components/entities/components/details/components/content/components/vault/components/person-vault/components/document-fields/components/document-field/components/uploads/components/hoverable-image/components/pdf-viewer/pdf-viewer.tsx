import {
  IcoChevronLeft24,
  IcoChevronRight24,
  IcoClose16,
} from '@onefootprint/icons';
import {
  Box,
  IconButton,
  LinkButton,
  Overlay,
  Stack,
  Text,
} from '@onefootprint/ui';
import * as Dialog from '@radix-ui/react-dialog';
import dynamic from 'next/dynamic';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type PdfViewerProps = {
  src: string;
  documentName: string;
};

const Document = dynamic(() => import('react-pdf').then(res => res.Document), {
  ssr: false,
});

const Page = dynamic(() => import('react-pdf').then(res => res.Page), {
  ssr: false,
});

const PdfViewer = ({ src, documentName }: PdfViewerProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.uploads.pdf-viewer',
  });
  const [numPages, setNumPages] = useState<number>();
  const [currPageNumber, setCurrPageNumber] = useState<number>(1);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<number>();

  useEffect(() => {
    const updatePageHeight = () => {
      const pageContainerHeight = pageContainerRef.current?.clientHeight;
      setPageHeight(pageContainerHeight ? pageContainerHeight - 150 : 0);
    };

    const resizeObserver = new ResizeObserver(updatePageHeight);

    const startResizeObserve = () => {
      if (document.body) resizeObserver.observe(document.body);
    };

    const stopResizeObserve = () => {
      if (document.body) resizeObserver.unobserve(document.body);
    };

    startResizeObserve();

    return stopResizeObserve;
  }, []);

  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: PDFDocumentProxy) => {
    setNumPages(nextNumPages);
  };

  const loadWebWorkerForPdf = async () => {
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url,
    ).toString();
  };

  const handleNextPage = () => {
    setCurrPageNumber(prev => (prev < (numPages ?? 0) ? prev + 1 : prev));
  };

  const handlePrevPage = () => {
    setCurrPageNumber(prev => (prev > 1 ? prev - 1 : prev));
  };

  return (
    <Dialog.Root>
      <Stack>
        <Dialog.Trigger asChild>
          <LinkButton onClick={loadWebWorkerForPdf}>{t('expand')}</LinkButton>
        </Dialog.Trigger>
      </Stack>
      <Dialog.Portal>
        <Overlay />
        <Container ref={pageContainerRef}>
          <Header>
            <Dialog.Close asChild>
              <IconButton aria-label="close">
                <IcoClose16 />
              </IconButton>
            </Dialog.Close>
            <Dialog.Title asChild>
              <Text variant="label-2">{documentName}</Text>
            </Dialog.Title>
            <Box width="24px" height="24px" />
          </Header>
          <Stack flexGrow={1} align="center" justify="center">
            <Document file={src} onLoadSuccess={onDocumentLoadSuccess}>
              <PageContainer>
                <Page
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  pageNumber={currPageNumber}
                  height={
                    pageHeight === 0 ? window.innerHeight - 200 : pageHeight
                  }
                />
              </PageContainer>
              <PageNavigator>
                <IconButton
                  onClick={handlePrevPage}
                  aria-label="previous page"
                  disabled={currPageNumber <= 1}
                >
                  <IcoChevronLeft24 />
                </IconButton>
                <Text variant="label-2">
                  {`${t('page')} ${currPageNumber} / ${numPages}`}
                </Text>
                <IconButton
                  onClick={handleNextPage}
                  aria-label="previous page"
                  disabled={currPageNumber >= (numPages ?? 0)}
                >
                  <IcoChevronRight24 />
                </IconButton>
              </PageNavigator>
            </Document>
          </Stack>
        </Container>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const Container = styled(Dialog.Content)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    box-shadow: ${theme.elevation[3]};
    z-index: ${theme.zIndex.confirmationDialog};
    position: absolute;
    top: 0;
    left: 0;
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const PageContainer = styled.div`
  ${({ theme }) => css`
    border: 1px solid ${theme.borderColor.primary};
  `};
`;

const PageNavigator = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    margin-top: ${theme.spacing[7]};
  `};
`;

const Header = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing[4]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    width: 100%;
    height: 56px;
  `}
`;

export default PdfViewer;
