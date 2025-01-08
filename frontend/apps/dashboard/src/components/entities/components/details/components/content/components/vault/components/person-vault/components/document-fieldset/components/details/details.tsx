import type { Document, DocumentUpload, EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import { Dialog, Stack } from '@onefootprint/ui';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';
import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import useDocumentsFilters from '../../hooks/use-documents-filters';
import findVisibleElement from '../../utils/find-visible-element';
import hasDrawerContent from '../../utils/has-drawer-content';
import showSelfiePreview from '../../utils/show-selfie-preview';
import Decrypt from './components/decrypt/decrypt';
import DetailsLayoutWrapper from './components/details-layout-wrapper';
import DrawerContent from './components/drawer-content';
import FailedUploads from './components/failed-uploads';
import SelfiePreview from './components/selfie-preview';
import TableOfContents from './components/table-of-contents';
import UploadImageItem from './components/upload-image-item';

export type DetailsProps = {
  document: Document;
  isDecryptable: boolean;
  isDecrypted: boolean;
  open: boolean;
  onDecrypt: (documentKind: SupportedIdDocTypes) => void;
  title: string;
  vault: EntityVault;
};

const Details = ({ document, isDecryptable, isDecrypted, open, onDecrypt, title, vault }: DetailsProps) => {
  const { clear } = useDocumentsFilters();
  const { kind, uploads } = document;
  const showDrawer = hasDrawerContent(document, vault);
  const [successfulUploads, failedUploads] = partition(uploads, upload => upload.failureReasons.length === 0);
  const groupedFailedUploads = Object.values(groupBy(failedUploads, 'side'));

  // For the table of contents buttons and the selfie preview
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const uploadRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleUploadIndex, setVisibleUploadIndex] = useState<number>(0);

  useEffect(() => {
    // The timeout is to ensure that the scroll container is rendered before the scroll event listener is added
    setTimeout(() => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      const updateVisibleUpload = () => {
        const containerRect = scrollContainer.getBoundingClientRect();
        const visibleIndex = findVisibleElement(containerRect, uploadRefs.current);
        if (visibleIndex !== -1) {
          setVisibleUploadIndex(visibleIndex);
        }
      };

      scrollContainer.addEventListener('scroll', updateVisibleUpload);
      updateVisibleUpload();

      return () => {
        scrollContainer.removeEventListener('scroll', updateVisibleUpload);
      };
    }, 300);
  }, [open, isDecrypted]);

  const scrollToUpload = (index: number) => {
    const target = uploadRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Dialog title={title} noPadding={true} noScroll={true} onClose={clear} open={open} size="full-screen">
      {isDecrypted ? (
        <DetailsLayoutWrapper
          drawerChildren={showDrawer && <DrawerContent document={document} vault={vault} />}
          ref={scrollContainerRef}
        >
          <TableOfContents
            successfulUploads={successfulUploads}
            failedUploads={groupedFailedUploads}
            onClick={scrollToUpload}
            visibleIndex={visibleUploadIndex}
          />
          <UploadsContainer direction="column" align="center" gap={8} width="70%" height="100%">
            {successfulUploads.map((upload, index) => (
              <UploadImageItem
                key={`${upload.identifier}:${upload.version}`}
                upload={upload as DocumentUpload & { isLatest: boolean }}
                vault={vault}
                ref={el => (uploadRefs.current[index] = el)}
              />
            ))}
            {failedUploads.length > 0 &&
              groupedFailedUploads.map((sameSideUploads, index) => (
                <FailedUploads
                  key={`${sameSideUploads[0].identifier}:${sameSideUploads[0].version}`}
                  uploads={sameSideUploads as (DocumentUpload & { isLatest: boolean })[]}
                  vault={vault}
                  ref={el => (uploadRefs.current[successfulUploads.length + index] = el)}
                />
              ))}
          </UploadsContainer>
          {showSelfiePreview(uploads, visibleUploadIndex) && <SelfiePreview uploads={uploads} vault={vault} />}
        </DetailsLayoutWrapper>
      ) : (
        <Decrypt isDecryptable={isDecryptable} onClick={() => onDecrypt(kind)} />
      )}
    </Dialog>
  );
};

const UploadsContainer = styled(Stack)`
  ${({ theme }) => css`
    > *:last-child {
      padding-bottom: ${theme.spacing[7]};
    }

    > *:first-child {
      padding-bottom: 0;
    }
  `};
`;

export default Details;
