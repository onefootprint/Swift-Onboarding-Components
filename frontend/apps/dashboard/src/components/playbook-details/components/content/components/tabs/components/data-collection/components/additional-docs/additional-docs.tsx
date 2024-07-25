import { IcoInfo16 } from '@onefootprint/icons';
import { IcoCode216, IcoFlag16, IcoWriting16 } from '@onefootprint/icons';
import { type DocumentRequestConfig, DocumentRequestKind } from '@onefootprint/types';
import { Box, Dropdown, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type AdditionalDocsProps = {
  docs: DocumentRequestConfig[];
};

const AdditionalDocs = ({ docs }: AdditionalDocsProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection.additional-docs' });
  const hasDocs = docs.length > 0;
  const list = docs.map(doc => {
    if (doc.kind === DocumentRequestKind.ProofOfSsn) {
      return {
        label: t('possn.title'),
        identifier: null,
        description: t('possn.description'),
        requiresHumanReview: doc.data.requiresHumanReview,
      };
    }
    if (doc.kind === DocumentRequestKind.ProofOfAddress) {
      return {
        label: t('poa.title'),
        identifier: null,
        description: t('poa.description'),
        requiresHumanReview: doc.data.requiresHumanReview,
      };
    }
    if (doc.kind === DocumentRequestKind.Custom) {
      return {
        label: doc.data.name,
        identifier: doc.data.identifier,
        description: doc.data.description || null,
        requiresHumanReview: doc.data.requiresHumanReview,
      };
    }
    throw new Error('Unknown document type');
  });

  return (
    <Stack gap={5} flexDirection="column">
      <Text variant="label-3">{t('title')}</Text>
      {hasDocs ? (
        <Stack gap={3} flexDirection="column">
          {list.map(doc => (
            <DocItem
              description={doc.description}
              identifier={doc.identifier}
              key={doc.label}
              label={doc.label}
              requiresHumanReview={doc.requiresHumanReview}
            />
          ))}
        </Stack>
      ) : (
        <Text variant="body-3" color="tertiary">
          {t('empty')}
        </Text>
      )}
    </Stack>
  );
};

type DocItemProps = {
  description: string | null;
  identifier: string | null;
  label: string;
  requiresHumanReview: boolean;
};

const DocItem = ({ label, identifier, description, requiresHumanReview }: DocItemProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection.additional-docs' });

  return (
    <Stack gap={2} alignItems="center">
      <Text variant="body-3" color="secondary">
        {label}
      </Text>
      <Dropdown.Root>
        <Dropdown.Trigger>
          <IcoInfo16 />
        </Dropdown.Trigger>
        <StyledDropdownContent align="start" side="top" sideOffset={8}>
          {identifier ? (
            <Stack gap={4} marginBottom={3}>
              <Box position="relative" top="3px">
                <IcoCode216 />
              </Box>
              <Text variant="snippet-2" color="secondary">
                {identifier}
              </Text>
            </Stack>
          ) : null}
          {description ? (
            <Stack gap={4} marginBottom={3}>
              <Box position="relative" top="3px">
                <IcoWriting16 />
              </Box>
              <Text variant="body-4" color="secondary">
                {description}
              </Text>
            </Stack>
          ) : null}
          {requiresHumanReview ? (
            <Stack gap={4}>
              <Box position="relative" top="3px">
                <IcoFlag16 />
              </Box>
              <Text variant="body-4" color="secondary">
                {t('requires-manual-review')}
              </Text>
            </Stack>
          ) : null}
        </StyledDropdownContent>
      </Dropdown.Root>
    </Stack>
  );
};

const StyledDropdownContent = styled(Dropdown.Content)`
  ${({ theme }) => css`
    width: 320px;
    padding: ${theme.spacing[4]};
  `}
`;

export default AdditionalDocs;
