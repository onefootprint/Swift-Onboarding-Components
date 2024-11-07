import type { DocumentUpload } from '@onefootprint/types';
import { Box, Stack, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useUploadSideText from '../../../../hooks/use-upload-side-text';

export type TableOfContentsProps = {
  uploads: DocumentUpload[];
  onClick: (index: number) => void;
  visibleIndex: number;
};

const TableOfContents = ({ uploads, onClick, visibleIndex }: TableOfContentsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details' });
  const sideT = useUploadSideText();

  if (uploads.length === 1) return null;

  const firstFailedIndex = uploads.findIndex(upload => upload.failureReasons.length > 0);
  const hasFailedUploads = firstFailedIndex !== -1;
  const uploadsWithButtons = hasFailedUploads ? uploads.slice(0, firstFailedIndex + 1) : uploads; // Only one button for all failed uploads
  const visibleIndexIsFailed = hasFailedUploads && visibleIndex >= firstFailedIndex;

  return (
    <Container position="fixed" alignSelf="flex-start">
      <Stack direction="column" gap={3}>
        {uploadsWithButtons.map(({ failureReasons, identifier, version, side }, index) => {
          const isFailedButton = index === firstFailedIndex;
          const isActive = index === visibleIndex || (isFailedButton && visibleIndexIsFailed);

          return (
            <UploadButton key={`${identifier}:${version}`} onClick={() => onClick(index)} $isActive={isActive}>
              {t('table-of-contents.label', {
                side: sideT(side),
                status:
                  failureReasons.length === 0
                    ? t('status.success')
                    : t('status.failed-count', { count: uploads.length - firstFailedIndex }),
              })}
            </UploadButton>
          );
        })}
      </Stack>
    </Container>
  );
};

const Container = styled(Box)`
  ${({ theme }) => css`
    bottom: ${theme.spacing[4]};
    left: calc(${theme.spacing[4]} + var(--drawer-width));
    transition: left 0.2s ease-in-out;
    z-index: ${theme.zIndex.drawer};
  `};
`;

const UploadButton = styled.div<{ $isActive: boolean }>`
  ${({ theme, $isActive }) => css`
    width: fit-content;
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[1]} solid ${$isActive ? theme.color.accent : theme.borderColor.tertiary};
    color: ${$isActive ? theme.color.accent : theme.color.tertiary};
    box-shadow: ${$isActive ? theme.elevation[2] : 'none'};
    ${createFontStyles('label-3')};
    background-color: ${theme.backgroundColor.primary};
    cursor: pointer;
  `};
`;

export default TableOfContents;
