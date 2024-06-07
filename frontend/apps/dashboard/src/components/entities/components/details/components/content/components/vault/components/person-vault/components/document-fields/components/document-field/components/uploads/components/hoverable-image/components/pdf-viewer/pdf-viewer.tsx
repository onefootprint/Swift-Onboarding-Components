import { IcoClose16 } from '@onefootprint/icons';
import { Box, IconButton, LinkButton, Overlay, Stack, Text } from '@onefootprint/ui';
import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import PdfThumbnail from './components/pdf-thumbnail';

type PdfViewerProps = {
  src: string;
  documentName: string;
};

const PdfViewer = ({ src, documentName }: PdfViewerProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.uploads.pdf-viewer',
  });

  return (
    <Dialog.Root>
      <Stack>
        <Dialog.Trigger asChild>
          <Stack direction="column" gap={5}>
            <PdfThumbnail src={src} />
            <LinkButton>{t('expand')}</LinkButton>
          </Stack>
        </Dialog.Trigger>
      </Stack>
      <Dialog.Portal>
        <Overlay />
        <Container>
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
          <iframe title="pdf" src={src} width="100%" height="100%" />
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

export default PdfViewer;
