import { FontVariant } from '@onefootprint/design-tokens';
import { IcoCode216, IcoFlag16, IcoWriting16 } from '@onefootprint/icons';
import { type DocumentRequestConfig, DocumentRequestKind } from '@onefootprint/types';
import { Box, Popover, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

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

const PopoverContent = ({ identifier, description, requiresHumanReview }: Omit<DocItemProps, 'label'>) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection.additional-docs' });

  const contentItems = [
    { condition: identifier, icon: <IcoCode216 />, text: identifier, variant: 'snippet-2' },
    { condition: description, icon: <IcoWriting16 />, text: description, variant: 'body-4' },
    { condition: requiresHumanReview, icon: <IcoFlag16 />, text: t('requires-manual-review'), variant: 'body-4' },
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

const DocItem = ({ label, identifier, description, requiresHumanReview }: DocItemProps) => {
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
