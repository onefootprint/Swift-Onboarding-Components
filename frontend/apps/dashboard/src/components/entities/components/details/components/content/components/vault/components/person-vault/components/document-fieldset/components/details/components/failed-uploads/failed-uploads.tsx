import type { DocumentUpload, EntityVault } from '@onefootprint/types';
import { Box, LinkButton, Stack, Text } from '@onefootprint/ui';
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import UploadImageItem from '../upload-image-item';
import UploadTitleCard from '../upload-title-card';

export type FailedUploadsProps = {
  uploads: (DocumentUpload & { isLatest: boolean })[];
  vault: EntityVault;
};

const FailedUploads = forwardRef<HTMLDivElement, FailedUploadsProps>(({ uploads, vault }, ref) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details' });
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (uploads.length === 1) {
    return <UploadImageItem upload={uploads[0]} vault={vault} ref={ref} />;
  }

  return (
    <Stack direction="column" align="center" width="100%" ref={ref}>
      <UploadTitleCard
        upload={uploads[0]}
        rightChildren={
          <Stack align="center" gap={2}>
            <Text variant="label-3">{t('title-card.attempts', { count: uploads.length })}</Text>
            <Text tag="span" variant="label-3">
              ⋅
            </Text>
            <LinkButton onClick={() => setIsCollapsed(prev => !prev)}>
              {isCollapsed ? t('title-card.show-all') : t('title-card.collapse')}
            </LinkButton>
          </Stack>
        }
      />
      {isCollapsed ? (
        <Box position="relative" width="100%" top="12px">
          {uploads.map((upload, index) => (
            <UploadImageItem
              key={`${upload.identifier}:${upload.version}`}
              upload={upload as DocumentUpload & { isLatest: boolean }}
              vault={vault}
              rotateIndex={index}
            />
          ))}
        </Box>
      ) : (
        <Box display="grid" width="100%" paddingLeft={5}>
          {uploads.map(upload => (
            <LinedUpload
              key={`${upload.identifier}:${upload.version}`}
              position="relative"
              paddingLeft={5}
              paddingTop={7}
            >
              <UploadImageItem upload={upload} vault={vault} imageOnly={true} />
            </LinedUpload>
          ))}
        </Box>
      )}
    </Stack>
  );
});

const LinedUpload = styled(Box)`
  ${({ theme }) => css`
    &:first-child {
      padding-top: ${theme.spacing[3]};
    }

    // Vertical line for every upload
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: ${theme.borderWidth[1]};
      height: 100%;
      background: ${theme.borderColor.primary};
    }

    // Curved line for every upload
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: ${theme.borderRadius.xl};
      height: ${theme.borderRadius.xl};
      border-left: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
      border-bottom-left-radius: ${theme.borderRadius.xl};
    }

    // Last upload's curved line stops slightly lower down
    &:last-child::after {
      top: 55%;
    }

    &:last-child::before {
      height: 55%;
    }
  `};
`;

export default FailedUploads;
