import type { FontVariant } from '@onefootprint/design-tokens';
import { IcoCode216, IcoFileText16, IcoFlag16, IcoWriting16 } from '@onefootprint/icons';
import {
  type CustomDocumentUploadSettings,
  type DocumentRequestConfig,
  DocumentRequestKind,
} from '@onefootprint/types';
import { Box, Divider, Popover, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type AdditionalDocsProps = {
  docs: DocumentRequestConfig[];
  variant?: 'sectioned' | 'default';
};

const AdditionalDocs = ({ docs, variant = 'default' }: AdditionalDocsProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection.additional-docs' });
  const list = docs.map(doc => {
    if (doc.kind === DocumentRequestKind.ProofOfSsn) {
      return {
        label: t('possn.title'),
        identifier: undefined,
        description: t('possn.description'),
        requiresHumanReview: doc.data.requiresHumanReview,
        uploadSettings: undefined,
      };
    }
    if (doc.kind === DocumentRequestKind.ProofOfAddress) {
      return {
        label: t('poa.title'),
        identifier: undefined,
        description: t('poa.description'),
        requiresHumanReview: doc.data.requiresHumanReview,
        uploadSettings: undefined,
      };
    }
    if (doc.kind === DocumentRequestKind.Custom) {
      return {
        label: doc.data.name,
        identifier: doc.data.identifier,
        description: doc.data.description,
        requiresHumanReview: doc.data.requiresHumanReview,
        uploadSettings: doc.data.uploadSettings,
      };
    }
    throw new Error('Unknown document type');
  });

  return (
    <Stack gap={4} flexDirection="column">
      <Text variant="label-4">{t('title')}</Text>
      {variant === 'sectioned' && (
        <>
          <Divider variant="secondary" />
          <Text variant="label-4">{t('docs-to-collect')}</Text>
        </>
      )}
      <Stack paddingLeft={3} gap={3} flexDirection="column">
        {list.map(doc => (
          <DocItem
            uploadSettings={doc.uploadSettings}
            description={doc.description}
            identifier={doc.identifier}
            key={doc.label}
            label={doc.label}
            requiresHumanReview={doc.requiresHumanReview}
          />
        ))}
      </Stack>
    </Stack>
  );
};

type DocItemProps = {
  uploadSettings: CustomDocumentUploadSettings | undefined;
  description: string | undefined;
  identifier: string | undefined;
  label: string;
  requiresHumanReview: boolean;
};

const PopoverContent = ({
  identifier,
  description,
  requiresHumanReview,
  uploadSettings,
}: Omit<DocItemProps, 'label'>) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection.additional-docs' });

  const contentItems = [
    { condition: !!identifier, icon: <IcoCode216 />, text: identifier, variant: 'snippet-2' },
    { condition: !!description, icon: <IcoWriting16 />, text: description, variant: 'body-4' },
    { condition: requiresHumanReview, icon: <IcoFlag16 />, text: t('requires-manual-review'), variant: 'body-4' },
    {
      condition: !!uploadSettings,
      icon: <IcoFileText16 />,
      text:
        uploadSettings === 'prefer_upload'
          ? t('collection-method.prefer-upload')
          : t('collection-method.prefer-capture'),
      variant: 'body-4',
    },
  ];

  return (
    <Stack direction="column" gap={3}>
      {contentItems.map(
        ({ condition, icon, text, variant }) =>
          condition && (
            <Stack key={text} gap={4}>
              <Box position="relative" marginTop={1}>
                {icon}
              </Box>
              <Text variant={variant as FontVariant} color="secondary">
                {text}
              </Text>
            </Stack>
          ),
      )}
    </Stack>
  );
};

const DocItem = ({ label, identifier, description, requiresHumanReview, uploadSettings }: DocItemProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection.additional-docs' });
  return (
    <Stack gap={2} alignItems="center">
      <Text variant="body-3" color="secondary">
        {label}
      </Text>
      {identifier || description || requiresHumanReview ? (
        <>
          <Text variant="body-3" color="secondary">
            ⋅
          </Text>
          <Popover
            content={
              <PopoverContent
                uploadSettings={uploadSettings}
                identifier={identifier}
                description={description}
                requiresHumanReview={requiresHumanReview}
              />
            }
          >
            <Text variant="body-3" color="secondary">
              {t('more-details')}
            </Text>
          </Popover>
        </>
      ) : null}
    </Stack>
  );
};

export default AdditionalDocs;
