import type { DocumentUpload } from '@onefootprint/types';
import { Box, Stack, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type LicenseAndSelfieDetailsProps = {
  uploads: DocumentUpload[];
  onClick: (index: number) => void;
  currentIndex: number;
};

const LicenseAndSelfieDetails = ({ uploads, onClick, currentIndex }: LicenseAndSelfieDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details' });
  const sideLabelMapping = {
    front: t('table-of-contents.side.front'),
    back: t('table-of-contents.side.back'),
    selfie: t('table-of-contents.side.selfie'),
  };

  return (
    <Container position="fixed" alignSelf="flex-start">
      <Stack direction="column" gap={3}>
        {uploads.map(({ failureReasons, identifier, version, side }, index) => {
          return (
            <UploadButton
              key={`${identifier}:${version}`}
              onClick={() => onClick(index)}
              $isSelected={index === currentIndex}
            >
              {t('table-of-contents.label', {
                side: sideLabelMapping[side],
                status: failureReasons.length === 0 ? t('status.success') : t('status.failed'),
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
  `};
`;

const UploadButton = styled.div<{ $isSelected: boolean }>`
  ${({ theme, $isSelected }) => css`
    width: fit-content;
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[1]} solid ${$isSelected ? theme.color.accent : theme.borderColor.tertiary};
    color: ${$isSelected ? theme.color.accent : theme.color.tertiary};
    box-shadow: ${$isSelected ? theme.elevation[2] : 'none'};
    ${createFontStyles('label-3')};
    background-color: ${theme.backgroundColor.primary};
    cursor: pointer;
  `};
`;

export default LicenseAndSelfieDetails;
