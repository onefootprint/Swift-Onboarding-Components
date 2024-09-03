import { Box, Stack, Text } from '@onefootprint/ui';
import type { StackProps } from '@onefootprint/ui/src/components/stack';
import { useTranslation } from 'react-i18next';
import type { CustomDoc } from '../../../../../../../utils/machine/types';

type CustomDocsPreviewProps = StackProps & Pick<CustomDoc, 'name' | 'uploadSettings' | 'identifier'>;

const CustomDocsPreview = ({ name, uploadSettings, identifier, ...rest }: CustomDocsPreviewProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.custom-docs',
  });

  return (
    <Stack flexDirection="column" gap={4} {...rest}>
      <Stack justifyContent="space-between" alignItems="center" gap={5}>
        <Text variant="body-3" color="tertiary" flex="none">
          {t('form.name.label')}
        </Text>
        <Text truncate variant="body-3">
          {name}
        </Text>
      </Stack>
      <Stack justifyContent="space-between" alignItems="center" gap={5}>
        <Text variant="body-3" color="tertiary">
          {t('form.identifier.label')}
        </Text>
        <Box
          backgroundColor="secondary"
          borderColor="tertiary"
          borderRadius="sm"
          borderStyle="solid"
          borderWidth={1}
          overflow="hidden"
          paddingBlock={1}
          paddingInline={2}
          userSelect="none"
        >
          <Text truncate variant="snippet-2" color="tertiary">
            document.custom.{identifier}
          </Text>
        </Box>
      </Stack>
      <Stack justifyContent="space-between" alignItems="center" gap={5}>
        <Text variant="body-3" color="tertiary">
          {t('form.collection-method.title')}
        </Text>
        <Text variant="body-3">
          {uploadSettings === 'prefer_upload'
            ? t('form.collection-method.prefer-upload.preview')
            : t('form.collection-method.prefer-capture.preview')}
        </Text>
      </Stack>
    </Stack>
  );
};

export default CustomDocsPreview;
