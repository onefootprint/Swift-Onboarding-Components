import {
  type DataIdentifier,
  type Document,
  type EntityVault,
  type SupportedIdDocTypes,
  isVaultDataEncrypted,
} from '@onefootprint/types';
import { Dialog, Stack } from '@onefootprint/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useDocumentsFilters from '../../hooks/use-documents-filters';
import findVisibleElement from '../../utils/find-visible-element';
import showSelfiePreview from '../../utils/show-selfie-preview';
import Decrypt from '../decrypt/decrypt';
import DetailsLayoutWrapper from '../details-layout-wrapper';
import DocumentImage from '../document-image';
import DrawerContent from './components/drawer-content';
import SelfiePreview from './components/selfie-preview';
import TableOfContents from './components/table-of-contents';
import UploadTitleCard from './components/upload-title-card/upload-title-card';

export type LicenseAndSelfieDetailsProps = {
  document: Document;
  isDecryptable: boolean;
  open: boolean;
  onDecrypt: (documentKind: SupportedIdDocTypes) => void;
  vault: EntityVault;
};

const LicenseAndSelfieDetails = ({ document, isDecryptable, open, onDecrypt, vault }: LicenseAndSelfieDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details' });
  const { clear } = useDocumentsFilters();
  const { kind, uploads } = document;
  const isEncrypted = uploads
    .map(u => `${u.identifier}:${u.version}` as DataIdentifier)
    .some(di => !(di in vault) || (di in vault && isVaultDataEncrypted(vault?.[di])));

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
  }, [open, isEncrypted]);

  const scrollToUpload = (index: number) => {
    const target = uploadRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Dialog
      title={t('license-and-selfie')}
      noPadding={true}
      noScroll={true}
      onClose={clear}
      open={open}
      size="full-screen"
    >
      {isEncrypted ? (
        <Decrypt isDecryptable={isDecryptable} onClick={() => onDecrypt(kind)} />
      ) : (
        <DetailsLayoutWrapper
          drawerChildren={<DrawerContent document={document} vault={vault} />}
          ref={scrollContainerRef}
        >
          <TableOfContents uploads={uploads} onClick={scrollToUpload} currentIndex={visibleUploadIndex} />
          <UploadsContainer direction="column" align="center" gap={8} width="70%">
            {uploads.map((upload, index) => {
              const vaultIndex = `${upload.identifier}:${upload.version}` as DataIdentifier;
              const vaultValue = vault[vaultIndex] as string;
              return (
                <UploadContainer
                  key={vaultIndex}
                  ref={el => (uploadRefs.current[index] = el)}
                  direction="column"
                  align="center"
                  gap={4}
                  width="100%"
                >
                  <UploadTitleCard upload={upload} />
                  <DocumentImage
                    base64Data={vaultValue}
                    documentName={t('license-and-selfie')}
                    isSuccess={upload.failureReasons.length === 0}
                  />
                </UploadContainer>
              );
            })}
          </UploadsContainer>
          {showSelfiePreview(uploads, visibleUploadIndex) && <SelfiePreview uploads={uploads} vault={vault} />}
        </DetailsLayoutWrapper>
      )}
    </Dialog>
  );
};

const UploadsContainer = styled(Stack)`
  ${({ theme }) => css`
    > *:last-child {
      padding-bottom: ${theme.spacing[7]};
    }
  `};
`;

const UploadContainer = styled(Stack)`
  ${({ theme }) => css`
    scroll-margin-top: ${theme.spacing[3]};
  `};
`;

export default LicenseAndSelfieDetails;
