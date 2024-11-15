import type { DocumentUpload } from '@onefootprint/types';
import { Box, Stack, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useUploadSideText from '../../../../hooks/use-upload-side-text';

export type TableOfContentsProps = {
  successfulUploads: DocumentUpload[];
  failedUploads: DocumentUpload[][];
  onClick: (index: number) => void;
  visibleIndex: number;
};

const TableOfContents = ({ successfulUploads, failedUploads, onClick, visibleIndex }: TableOfContentsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details' });
  const sideT = useUploadSideText();

  if (successfulUploads.length + failedUploads.flat().length === 1) return null;

  return (
    <Container position="fixed" alignSelf="flex-start">
      <Stack direction="column" gap={3}>
        {successfulUploads.map(({ identifier, version, side }, index) => {
          const isActive = index === visibleIndex;
          return (
            <UploadButton key={`${identifier}:${version}`} onClick={() => onClick(index)} $isActive={isActive}>
              {t('table-of-contents.label', {
                side: sideT(side),
                status: t('status.success'),
              })}
            </UploadButton>
          );
        })}
        {failedUploads.map((sameSideUploads, index) => {
          const { identifier, version, side } = sameSideUploads[0];
          const actualIndex = index + successfulUploads.length;
          const isActive = actualIndex === visibleIndex;
          return (
            <UploadButton key={`${identifier}:${version}`} onClick={() => onClick(actualIndex)} $isActive={isActive}>
              {t('table-of-contents.label', {
                side: sideT(side),
                status: t('status.failed-count', { count: sameSideUploads.length }),
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
