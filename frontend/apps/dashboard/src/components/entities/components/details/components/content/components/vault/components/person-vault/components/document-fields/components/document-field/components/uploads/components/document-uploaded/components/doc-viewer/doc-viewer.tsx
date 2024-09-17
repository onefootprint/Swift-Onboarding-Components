import { IcoClose16 } from '@onefootprint/icons';
import { Box, IconButton, LinkButton, Overlay, Stack, Text } from '@onefootprint/ui';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Image from 'next/image';
import PdfThumbnail from './components/pdf-thumbnail';

type DocViewerProps = {
  children?: React.ReactNode;
  documentName: string;
  mimeType: string | null;
  src: string;
};

const DocViewer = ({ children, documentName, mimeType, src }: DocViewerProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.uploads.doc-viewer',
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();
    handleClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Stack>
        <Dialog.Trigger asChild>
          <Stack direction="column" gap={5}>
            {children || <PdfThumbnail src={src} />}
            <LinkButton onClick={handleOpen}>{t('expand')}</LinkButton>
          </Stack>
        </Dialog.Trigger>
      </Stack>
      <Dialog.Portal>
        <Overlay />
        <Container onEscapeKeyDown={handleEscapeKeyDown} onPointerDownOutside={handleClose}>
          <Header>
            <Dialog.Close asChild>
              <IconButton aria-label="close" onClick={handleClose}>
                <IcoClose16 />
              </IconButton>
            </Dialog.Close>
            <Dialog.Title asChild>
              <Text variant="label-2">{documentName}</Text>
            </Dialog.Title>
            <Box width="24px" height="24px" />
          </Header>
          {mimeType === 'application/pdf' ? (
            <iframe title={documentName} src={src} width="100%" height="100%" />
          ) : (
            <StyledImage src={src} width={0} height={0} alt={documentName} />
          )}
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

const StyledImage = styled(Image)`
  width: 100%;
  height: calc(100% - 56px);
  object-fit: contain;
`;

export default DocViewer;
